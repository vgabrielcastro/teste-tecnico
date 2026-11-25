import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import Database from 'better-sqlite3';
import { createApp } from '../src/app.js';
import { initializeDatabase } from '../src/database/connection.js';
import { createAccountsRepository } from '../src/repositories/accounts.repository.js';
import { createAccountsService } from '../src/services/accounts.service.js';

let database;
let server;
let baseUrl;

before(async () => {
  database = new Database(':memory:');
  initializeDatabase(database);
  const repository = createAccountsRepository(database);
  const service = createAccountsService(repository);
  server = createApp(service).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  database.close();
});

test('lists seeded accounts and supports create, update and delete', async () => {
  const listResponse = await fetch(`${baseUrl}/accounts`);
  assert.equal(listResponse.status, 200);
  const listBody = await listResponse.json();
  assert.equal(listBody.data.length, 4);
  assert.deepEqual(listBody.data.map((account) => account.name), [
    'Time UX',
    'AdOps',
    'TechOps',
    'Time Dev',
  ]);

  const createResponse = await fetch(`${baseUrl}/accounts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'QA', description: 'Conta de teste' }),
  });
  assert.equal(createResponse.status, 201);
  const createdAccount = (await createResponse.json()).data;
  assert.equal(createdAccount.name, 'QA');

  const updateResponse = await fetch(`${baseUrl}/accounts/${createdAccount.id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'QA Atualizada', description: 'Atualizada' }),
  });
  assert.equal(updateResponse.status, 200);
  assert.equal((await updateResponse.json()).data.name, 'QA Atualizada');

  const deleteResponse = await fetch(`${baseUrl}/accounts/${createdAccount.id}`, {
    method: 'DELETE',
  });
  assert.equal(deleteResponse.status, 204);
  assert.equal(database.prepare('SELECT id FROM accounts WHERE id = ?').get(createdAccount.id), undefined);
});

test('rejects invalid account data and unknown account ids', async () => {
  const invalidResponse = await fetch(`${baseUrl}/accounts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'QA', description: 'x'.repeat(41) }),
  });
  assert.equal(invalidResponse.status, 400);
  assert.equal((await invalidResponse.json()).error.code, 'VALIDATION_ERROR');

  const missingResponse = await fetch(`${baseUrl}/accounts/9999`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Missing', description: '' }),
  });
  assert.equal(missingResponse.status, 404);
  assert.equal((await missingResponse.json()).error.code, 'ACCOUNT_NOT_FOUND');
});

test('does not reinsert sample accounts after the list is emptied', () => {
  database.prepare('DELETE FROM accounts').run();
  initializeDatabase(database);

  const { count } = database
    .prepare('SELECT COUNT(*) AS count FROM accounts')
    .get();

  assert.equal(count, 0);
});

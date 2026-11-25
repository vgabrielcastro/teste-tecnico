import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const databasePath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../data/accounts.sqlite',
);

export function createDatabase(path = databasePath) {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }

  const database = new Database(path);
  database.pragma('foreign_keys = ON');
  initializeDatabase(database);

  return database;
}

export function initializeDatabase(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL CHECK (length(trim(name)) > 0),
      description TEXT NOT NULL CHECK (length(description) <= 40)
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  const seedMarker = database
    .prepare('SELECT value FROM app_metadata WHERE key = ?')
    .get('sample_accounts_seeded');

  if (!seedMarker) {
    const { count } = database
      .prepare('SELECT COUNT(*) AS count FROM accounts')
      .get();
    const insertAccount = database.prepare(
      'INSERT INTO accounts (name, description) VALUES (?, ?)',
    );

    const seedAccounts = database.transaction(() => {
      if (count === 0) {
        const accounts = [
          { name: 'Time UX', description: 'Descrição da conta.' },
          { name: 'AdOps', description: 'Descrição da conta.' },
          { name: 'TechOps', description: 'Descrição da conta.' },
          { name: 'Time Dev', description: 'Descrição da conta.' },
        ];

        for (const account of accounts) {
          insertAccount.run(account.name, account.description);
        }
      }

      database
        .prepare('INSERT INTO app_metadata (key, value) VALUES (?, ?)')
        .run('sample_accounts_seeded', 'true');
    });

    seedAccounts();
  }
}

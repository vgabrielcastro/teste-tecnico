import { createApp } from './app.js';
import { createDatabase } from './database/connection.js';
import { createAccountsRepository } from './repositories/accounts.repository.js';
import { createAccountsService } from './services/accounts.service.js';

const port = Number(process.env.PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT deve ser uma porta válida entre 1 e 65535.');
}

const database = createDatabase();
const repository = createAccountsRepository(database);
const service = createAccountsService(repository);
const app = createApp(service);

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`API disponível em http://127.0.0.1:${port}`);
});

function shutdown() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

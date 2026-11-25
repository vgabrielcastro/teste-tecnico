import express from 'express';
import { createAccountsController } from './controllers/accounts.controller.js';
import { createAccountsRouter } from './routes/accounts.routes.js';

export function createApp(service) {
  const app = express();
  const controller = createAccountsController(service);

  app.use(express.json({ limit: '10kb' }));
  app.use('/accounts', createAccountsRouter(controller));

  app.use((_request, response) => {
    response.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' },
    });
  });

  app.use((error, _request, response, _next) => {
    if (error.type === 'entity.parse.failed') {
      response.status(400).json({
        success: false,
        error: { code: 'INVALID_JSON', message: 'O corpo JSON é inválido.' },
      });
      return;
    }

    if (error.status === 413) {
      response.status(413).json({
        success: false,
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'O corpo da requisição é muito grande.' },
      });
      return;
    }

    if (error.status && error.code) {
      response.status(error.status).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }

    console.error('Erro inesperado na API:', error);
    response.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno.' },
    });
  });

  return app;
}

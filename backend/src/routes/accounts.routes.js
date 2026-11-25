import { Router } from 'express';

export function createAccountsRouter(controller) {
  const router = Router();

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}

export function createAccountsController(service) {
  return {
    list(_request, response) {
      response.json({ success: true, data: service.list() });
    },
    create(request, response) {
      const account = service.create(request.body);
      response.status(201).json({ success: true, data: account });
    },
    update(request, response) {
      const account = service.update(request.params.id, request.body);
      response.json({ success: true, data: account });
    },
    delete(request, response) {
      service.delete(request.params.id);
      response.status(204).end();
    },
  };
}

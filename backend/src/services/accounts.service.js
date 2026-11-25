export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function validateAccount(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'A conta deve ser um objeto.');
  }

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const description =
    typeof input.description === 'string' ? input.description.trim() : null;

  if (!name) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'O nome da conta é obrigatório.');
  }

  if (description === null) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'A descrição da conta deve ser um texto.',
    );
  }

  if (description.length > 40) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'A descrição deve ter no máximo 40 caracteres.',
    );
  }

  return { name, description };
}

function parseAccountId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id < 1) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'O ID da conta é inválido.');
  }

  return id;
}

export function createAccountsService(repository) {
  return {
    list() {
      return repository.findAll();
    },
    create(input) {
      return repository.create(validateAccount(input));
    },
    update(idValue, input) {
      const id = parseAccountId(idValue);
      const account = repository.update(id, validateAccount(input));

      if (!account) {
        throw new HttpError(404, 'ACCOUNT_NOT_FOUND', 'Conta não encontrada.');
      }

      return account;
    },
    delete(idValue) {
      const id = parseAccountId(idValue);

      if (!repository.delete(id)) {
        throw new HttpError(404, 'ACCOUNT_NOT_FOUND', 'Conta não encontrada.');
      }
    },
  };
}

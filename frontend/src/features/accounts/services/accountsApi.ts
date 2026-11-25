import type {
  IAccount,
  ICreateAccountInput,
  IUpdateAccountInput,
} from '../../../types';

const ACCOUNTS_API_URL = '/api/accounts';
export const ACCOUNTS_QUERY_KEY = ['accounts'] as const;

export class AccountsApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message);
    this.name = 'AccountsApiError';
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAccount(value: unknown): value is IAccount {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    Number.isSafeInteger(value.id) &&
    typeof value.name === 'string' &&
    typeof value.description === 'string'
  );
}

function parseAccountListResponse(value: unknown): IAccount[] {
  if (
    !isRecord(value) ||
    value.success !== true ||
    !Array.isArray(value.data) ||
    !value.data.every(isAccount)
  ) {
    throw new Error('A API retornou uma lista de contas inválida.');
  }

  return value.data;
}

function parseAccountResponse(value: unknown): IAccount {
  if (!isRecord(value) || value.success !== true || !isAccount(value.data)) {
    throw new Error('A API retornou uma conta inválida.');
  }

  return value.data;
}

async function readError(response: Response): Promise<AccountsApiError> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    return new AccountsApiError(
      'Não foi possível concluir a solicitação.',
      response.status,
    );
  }

  if (isRecord(body)) {
    const error = body.error;
    if (isRecord(error)) {
      const message =
        typeof error.message === 'string'
          ? error.message
          : 'Não foi possível concluir a solicitação.';
      const code = typeof error.code === 'string' ? error.code : undefined;

      return new AccountsApiError(message, response.status, code);
    }
  }

  return new AccountsApiError(
    'Não foi possível concluir a solicitação.',
    response.status,
  );
}

async function requestJson(
  url: string,
  init?: RequestInit,
): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o backend está em execução.');
  }

  if (!response.ok) {
    throw await readError(response);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('A API retornou uma resposta JSON inválida.');
  }
}

export async function getAccounts(): Promise<IAccount[]> {
  const response = await requestJson(ACCOUNTS_API_URL);
  return parseAccountListResponse(response);
}

export async function createAccount(
  account: ICreateAccountInput,
): Promise<IAccount> {
  const response = await requestJson(ACCOUNTS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  });

  return parseAccountResponse(response);
}

export async function updateAccount(
  account: IUpdateAccountInput,
): Promise<IAccount> {
  const { id, ...updates } = account;
  const response = await requestJson(`${ACCOUNTS_API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  return parseAccountResponse(response);
}

export async function deleteAccount(id: number): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${ACCOUNTS_API_URL}/${id}`, { method: 'DELETE' });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o backend está em execução.');
  }

  if (!response.ok) {
    throw await readError(response);
  }
}

export function getApiErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Ocorreu um erro inesperado. Tente novamente.';
}


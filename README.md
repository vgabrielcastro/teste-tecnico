# Teste técnico — React, SQLite e Google Publisher Tag

Este repositório reúne as entregas do teste técnico. A interface de contas e os fluxos de criar, editar e excluir estão implementados; o backend SQLite já está disponível para a próxima etapa de integração.

## Estrutura do projeto

```text
teste/
├── frontend/                 # Aplicação React + TypeScript + Vite
│   ├── public/               # Ícones e arquivos estáticos do front
│   └── src/
│       ├── components/       # Componentes fornecidos para a interface
│       ├── features/accounts/pages/
│       ├── types.ts
│       ├── App.tsx
│       └── main.tsx
├── backend/                  # API Node/Express + SQLite
├── imagem1.png ... imagem5.png # Referências visuais do teste
└── README.md
```

O `banner.js` será adicionado separadamente, pois deve funcionar sem depender da aplicação React.

## Por que separar frontend e backend

O projeto será dividido em `frontend/` e `backend/` para manter a interface e a API organizadas em seus próprios diretórios. Essa separação facilita encontrar e manter o código, além de permitir instalar dependências e executar cada parte de forma independente.

## Componentes e assets existentes

Os componentes React foram movidos para `frontend/src/components/` porque são código-fonte da interface e precisam ficar dentro do projeto Vite. Os ícones usados por eles ficam em `frontend/public/`, que é servido pelo Vite como conteúdo estático.

As imagens `imagem1.png` a `imagem5.png` permanecem na raiz como referência para comparar a tela.

## Alterações nos componentes existentes

- **Header:** adicionados os links “Contas” e “Templates”, o estado visual de “Contas” selecionado e a ação visual “Sair”, para aproximar o cabeçalho da referência.
- **CardAccount:** adicionados os tipos explícitos, substituído o import pelo índice geral por imports diretos e ajustados os estilos do card. Isso evita dependências indiretas e aproxima a listagem do layout esperado.
- **CreateAccountModal:** importados diretamente o botão e os ícones, usado o tipo `IFormProps` explícito e definido um contrato mínimo para mutations. Isso permite usar callbacks em memória agora e substituir por `useMutation` ao conectar a API. Os estilos, textos e botões foram ajustados à referência, com dimensões ligeiramente ampliadas para melhorar a leitura.
- **ModalDelete:** ajustados dimensões, espaçamentos e botões conforme a referência e ligeiramente ampliados; o nome da conta fica destacado na confirmação.
- **Button:** o ícone passou a aceitar `ReactNode`; `onClick`, `style` e `type` são herdados dos atributos nativos do botão, mantendo a tipagem compatível com React e TypeScript atuais.

## Componentes criados

- **AccountsPage:** criada para exibir as contas e controlar em memória os fluxos de menu, criação, edição e exclusão, mantendo essa funcionalidade específica dentro de `features/accounts`.

Os fluxos de criar, editar e excluir no frontend ainda usam um array em memória. O backend já tem endpoints REST e persistência SQLite; a integração com o frontend será feita na próxima etapa.

## Executar o frontend

Requer Node.js e npm instalados.

```powershell
cd frontend
npm install
npm run dev
```

O Vite informa no terminal o endereço local da aplicação, normalmente `http://localhost:5173`.

## Executar o backend

Em outro terminal:

```powershell
cd backend
npm install
npm run dev
```

A API fica disponível em `http://127.0.0.1:3001`. Na primeira execução, cria `backend/data/accounts.sqlite` e insere três contas de exemplo. O arquivo do banco é local e ignorado pelo Git.

### Rotas da API

Base URL local: `http://127.0.0.1:3001`.

| Método | Rota | Ação | Resposta de sucesso |
|---|---|---|---|
| `GET` | `/accounts` | Lista as contas | `200 OK` |
| `POST` | `/accounts` | Cria uma conta | `201 Created` |
| `PUT` | `/accounts/:id` | Atualiza nome e descrição | `200 OK` |
| `DELETE` | `/accounts/:id` | Exclui uma conta | `204 No Content` |

O `POST` e o `PUT` recebem JSON com `name` e `description`. O nome é obrigatório e a descrição aceita no máximo 40 caracteres.

```json
{
  "name": "Minha conta",
  "description": "Descrição da conta."
}
```

Exemplo de resposta do `GET /accounts`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Time UX",
      "description": "Descrição da conta."
    }
  ]
}
```

Exemplo de resposta ao criar uma conta (`POST /accounts`):

```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Minha conta",
    "description": "Descrição da conta."
  }
}
```

Para testar no Postman ou Insomnia, use a Base URL e a rota da tabela. No `POST` e no `PUT`, selecione **Body → raw → JSON** e envie o objeto acima. Para editar e excluir, substitua `:id` pelo `id` retornado ao criar a conta. O `DELETE` retorna `204` sem corpo.

Erros de validação retornam `400 Bad Request` com um objeto `error`; um ID válido que não existe retorna `404 Not Found`. Rode `npm test` dentro de `backend/` para executar os testes da API.

## Próximas etapas

1. Conectar o frontend à API.
2. Implementar e testar o `banner.js` independente.

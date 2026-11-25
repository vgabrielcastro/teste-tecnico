# Teste técnico — React, SQLite e Google Publisher Tag

Este repositório reúne as entregas do teste técnico. A interface de contas está integrada à API REST, e as operações de criar, editar e excluir são persistidas no SQLite.

## Estrutura do projeto

```text
teste/
├── frontend/                 # Aplicação React + TypeScript + Vite
│   ├── public/               # Ícones e arquivos estáticos do front
│   └── src/
│       ├── components/       # Componentes fornecidos para a interface
│       ├── features/accounts/
│       │   ├── pages/        # Página e estilos da listagem de contas
│       │   └── services/     # Comunicação com a API de contas
│       ├── types.ts
│       ├── App.tsx
│       └── main.tsx
├── backend/                  # API Node/Express + SQLite
├── banner.js                 # Banner GPT independente do React
├── banner-demo.html          # Página HTML isolada para testar o banner
├── test/banner.test.mjs      # Testes do comportamento do banner
├── scripts/dev.mjs           # Instala dependências e inicia os dois serviços
├── package.json              # Comandos de desenvolvimento da raiz
├── imagem1.png ... imagem5.png # Referências visuais do teste
└── README.md
```

O `banner.js` e sua página de demonstração são independentes da aplicação React.

## Clonar e executar localmente

Requisitos: Git, Node.js 20.19+ ou 22.12+ e npm. O banner requer conexão com a internet para carregar a biblioteca GPT.

Clone o repositório:

```powershell
git clone https://github.com/vgabrielcastro/teste-tecnico.git
cd teste-tecnico
```

### Um comando para iniciar tudo

Na raiz do repositório, rode:

```powershell
npm run dev
```

O script instala as dependências do frontend e do backend caso ainda não estejam instaladas e inicia os dois processos. A página fica em `http://localhost:5173/`, e a API em `http://127.0.0.1:3001`. Pressione `Ctrl+C` para encerrar ambos. Esse comando requer Node.js e npm previamente instalados; ele instala os pacotes do projeto, não o próprio Node.js/npm.

Se preferir instalar as dependências antes de iniciar os servidores, rode `npm run setup` na raiz. Depois use `npm run dev` para iniciar o projeto.

### Inicialização manual

Também é possível iniciar os serviços sem o script. Em um terminal aberto na raiz, instale e rode o backend:

```powershell
cd backend
npm install
npm run dev
```

Em outro terminal aberto na raiz, instale e rode o frontend:

```powershell
cd frontend
npm install
npm run dev
```

Mantenha os dois processos ativos para usar a página integrada à API. O Vite encaminha `/api` ao backend em `http://127.0.0.1:3001`.

## Por que separar frontend e backend

O projeto é dividido em `frontend/` e `backend/` para manter a interface e a API organizadas em seus próprios diretórios. Essa separação facilita encontrar e manter o código, além de permitir instalar dependências e executar cada parte de forma independente.

## Componentes e assets existentes

Os componentes React foram movidos para `frontend/src/components/` porque são código-fonte da interface e precisam ficar dentro do projeto Vite. Os ícones usados por eles ficam em `frontend/public/`, que é servido pelo Vite como conteúdo estático.

As imagens `imagem1.png` a `imagem5.png` permanecem na raiz como referência para comparar a tela.

## Alterações nos componentes existentes

- **Header:** adicionados os links “Contas” e “Templates”, o estado visual de “Contas” selecionado e a ação visual “Sair”, para aproximar o cabeçalho da referência.
- **CardAccount:** adicionados tipos explícitos, imports diretos e estilos ajustados. O menu do card aciona as ações de editar e excluir da página.
- **CreateAccountModal:** conectado às mutations React Query para criar e editar; mantém o formulário aberto e mostra o erro se a API falhar, além de indicar o estado de envio. O layout e os estilos foram aproximados das referências.
- **ModalDelete:** ajustados dimensões, espaçamentos e botões conforme a referência; o nome da conta fica destacado, e falhas na exclusão são exibidas no modal.
- **Button:** o ícone passou a aceitar `ReactNode`; `onClick`, `style` e `type` são herdados dos atributos nativos do botão, mantendo a tipagem compatível com React e TypeScript atuais.

## Componentes criados

- **AccountsPage:** criada em `features/accounts/pages/` para manter a funcionalidade de contas organizada por feature. Exibe dados da API, trata carregamento/erro/lista vazia e coordena as mutations de criar, editar e excluir.

O serviço `frontend/src/features/accounts/services/accountsApi.ts` centraliza as chamadas HTTP e valida as respostas da API em runtime. O React Query mantém a lista em cache e a atualiza após cada operação.

## Endereços locais e API

O frontend abre em `http://localhost:5173/` e a API em `http://127.0.0.1:3001`. Na primeira execução, o backend cria `backend/data/accounts.sqlite` e insere quatro contas de exemplo: Time UX, AdOps, TechOps e Time Dev. Uma lista esvaziada não é repovoada em reinicializações posteriores. O arquivo do banco é local e ignorado pelo Git. Durante o desenvolvimento, o Vite encaminha as chamadas de `/api` para o backend; mantenha ambos os processos ativos para usar a tela integrada.

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

## Questão 2 — Banner Google Publisher Tag

O banner fica em `banner.js`, sem dependência do React. Em uma página HTML, inclua a tag abaixo antes de `</body>` (com `banner.js` acessível no caminho indicado):

```html
<script src="./banner.js"></script>
```

Não é necessário criar a `div` do anúncio nem escrever CSS: o próprio arquivo carrega a biblioteca oficial do GPT de forma assíncrona, cria o contêiner e injeta seus estilos. Ele define o slot `/8804/teste/qa1`; a partir de 768px, usa 728×90 fixo na parte inferior, e abaixo disso usa 300×250 fixo a 20px das bordas direita e inferior. O mesmo slot é atualizado a cada 30 segundos, sem chamar `clear()`, recarregar a página ou recriar o slot.

### Visualizar a demonstração

A demonstração já contém somente a tag que carrega `banner.js`. Para servi-la localmente sem instalar Python, abra um terminal na raiz do repositório e execute:

```powershell
cd frontend
npm run dev -- .. --host 127.0.0.1 --port 8000
```

Acesse `http://localhost:8000/banner-demo.html` e redimensione a janela para conferir o comportamento responsivo. Para parar o servidor, volte ao terminal e pressione `Ctrl+C`. Essa demonstração é independente da aplicação React em `localhost:5173`.

O conteúdo visual do anúncio vem do Google Ad Manager, não do `banner.js`. O ad unit de teste pode mostrar uma peça de demonstração, como a faixa com “728 × 90”. Um anúncio de campanha real só aparece se houver uma campanha elegível configurada para esse ad unit; o código solicita e posiciona o anúncio, mas não controla qual criativo será retornado nem garante preenchimento. É necessária conexão com a internet para carregar a GPT.

Para executar os testes automatizados do banner:

```powershell
node --test test/banner.test.mjs
```

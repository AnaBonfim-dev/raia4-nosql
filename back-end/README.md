
# Backend - SwimTrack

Backend responsável pelo cadastro e gerenciamento do histórico de treinos de natação.

## Tecnologias utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- CORS
- Dotenv

## Instalação

1. Instale o Node.js.
2. Abra o terminal dentro da pasta backend.
3. Execute:

npm install

## Configuração do banco de dados

Crie um arquivo chamado .env na pasta backend.

Adicione sua string de conexão:

MONGO_URI=sua_string_de_conexao

## Executar o servidor

Execute:

node server.js

O servidor será iniciado na porta 3000.

## Rotas da API

| Método | Rota | Função |
|---|---|---|
| GET | /api/treinos | Listar treinos |
| GET | /api/treinos/:id | Buscar treino |
| POST | /api/treinos | Cadastrar treino |
| PUT | /api/treinos/:id | Atualizar treino |
| DELETE | /api/treinos/:id | Excluir treino |

## Desenvolvido para o projeto acadêmico SwimTrack.


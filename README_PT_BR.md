# Sobre

Nos últimos 5 anos trabalhei com desenvolvimento de aplicações web, a maioria delas utilizando Node.js e MongoDB.

Reuni aqui aquilo que penso ser fundamental e um bom ponto de partida para desenvolver APIs REST com Node.js e MongoDB.

O servidor inclui:

- Autenticação;
- Permissões;
- Validação de parâmetros, query e dados;
- CRUD básico fácil de ser replicado;
- Erros padronizados;
- Respostas padronizadas;
- Testes E2E (end to end);

Considero a quantidade de dependências relativamente baixa, e penso ser importante manter desta forma, sempre que possível.

# Setup

Naturalmente, é necessário ter instalado o Node.js e o MongoDB, de preferência em suas versões mais recentes.

## Obter a última versão do servidor:

```cli
git clone https://github.com/conradoac/node-rest-api.git
```

## Instalar todas as dependências:

```cli
npm install
```

## Executar

Antes de executar, é necessário criar um arquivo de nome _.env_ no mesmo nível da pasta _src_. Este arquivo deve conter duas informações: `DB_URI` e `SECRET_KEY`.

```
DB_URI=mongodb://localhost:27017/mydb
SECRET_KEY=SomeSecretKey
```

Para executar o servidor:

```cli
npm start
```

# Testes

Para que os testes sejam executados corretamente, duas coisas são necessárias:

1. Um arquivo _.env_ no diretório _test_. Este arquivo deve conter as mesmas informações que o arquivo _.env_ da aplicação, mas com as configurações do ambiente de teste.

2. Um usuário registrado no banco de dados, com as seguintes informações:

```json
{
    "username": "tester",
    "password": "123456",
    "role": "Admin"
}

Para executar os testes:

```cli
npm test
```
# About

In the last 5 years, I worked with web application development, most of them using Node.js and MongoDB.

I gathered here what I think is fundamental and a good starting point to develop REST APIs with Node.js and MongoDB.

The server includes:

- Authentication;
- Permissions;
- Data validation (URL parameters, query parameters and body);
- Basic CRUD easy to be replicated;
- Standardized errors;
- Standardized responses;
- E2E tests;

I consider the number of dependencies relatively low, and I think it is important to keep it this way, whenever possible.

# Setup

It is necessary to have Node.js installed, preferably in its most recent versions.

## Get the latest version of the server

```cli
git clone https://github.com/conradoac/node-rest-api.git
```

## Install all dependencies

```cli
npm install
```

# Run

Before running, you need to create a file named _.env_ at the same level as the _src_ folder. This file must contain two information: `DB_URI` and` SECRET_KEY`.

```
DB_URI=mongodb://localhost:27017/mydb
SECRET_KEY=SomeSecretKey
```

## To execute

```cli
npm start
```

# Tests

For tests to run correctly, two things are necessary:

1. A _.env_ file in the _test_ directory. This file must contain the same information as the application's _.env_ file, but with the test environment settings.

2. A user registered in the database, with the following information:

```json
{
    "username": "tester",
    "password": "123456",
    "role": "Admin"
}
```

## To run the tests

```cli
npm test
```
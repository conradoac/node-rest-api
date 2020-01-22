const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));

module.exports = app;
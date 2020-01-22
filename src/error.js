const { isLength, isIn, isInt, isMongoId } = require('validator');
const { Constraints } = require('./db');
const UserRole = require('./user-role');

const MAX_QUERY_LIMIT = 1000;

const ServerError = {
    Unauthorized: 'Unauthorized',
    NotAllowed: 'NotAllowed',
    DuplicateKey: 'DuplicateKey',
    Unexpected: 'Unexpected',
    QueryLimitInvalid: 'QueryLimitInvalid',
    QuerySkipInvalid: 'QuerySkipInvalid',
    IdParameterInvalid: 'IdParameterInvalid',
    UsernameIsRequired: 'UsernameIsRequired',
    UsernameInvalid: 'UsernameInvalid',
    UserPasswordIsRequired: 'UserPasswordIsRequired',
    UserPasswordInvalid: 'UserPasswordInvalid',
    UserRoleIsRequired: 'UserRoleIsRequired',
    UserRoleInvalid: 'UserRoleInvalid',
    SignInUserNotFound: 'SignInUserNotFound',
    SignInWrongPassword: 'SignInWrongPassword'
};

const MongoError = {
    DuplicateKey: 11000
};

// This function helps improve readability.
// It is also a good place to add logs.
function error(code, message) {
    const res = {
        error: {
            code
        }
    };

    if (message)
        res.error.message = message;

    return res;
}

function isUndefined(v) {
    return typeof v === 'undefined';
}

function isString(v) {
    return typeof v === 'string';
}

function getQueryLimitError(limit) {
    if (limit && !isInt(limit, { min: 1, max: MAX_QUERY_LIMIT }))
        return ServerError.QueryLimitInvalid;
    return '';
}

function getQuerySkipError(skip) {
    if (skip && !isInt(skip, { min: 0 }))
        return ServerError.QuerySkipInvalid;
    return '';
}

function getIdParameterError(id) {
    return isMongoId(id)
        ? ''
        : ServerError.IdParameterInvalid;
}

function getUsernameError(username, required) {
    if (isUndefined(username) && required)
        return ServerError.UsernameIsRequired;
    if (isUndefined(username))
        return '';
    if (!isString(username) || !isLength(username.trim(), { min: 1, max: Constraints.UsernameMaxLength }))
        return ServerError.UsernameInvalid;
    return '';
}

function getUserPasswordError(password, required) {
    if (isUndefined(password) && required)
        return ServerError.UserPasswordIsRequired;
    if (isUndefined(password))
        return '';
    if (!isString(password) || !isLength(password, { min: Constraints.UserPasswordMinLength, max: Constraints.UserPasswordMaxLength }))
        return ServerError.UserPasswordInvalid;
    return '';
}

function getUserRoleError(role, required) {
    if (isUndefined(role) && required)
        return ServerError.UserRoleIsRequired;
    if (isUndefined(role))
        return '';
    if (!isString(role) || !isIn(role, Object.values(UserRole)))
        return ServerError.UserRoleInvalid;
    return '';
}

module.exports = {
    ServerError,
    MongoError,
    error,
    getQueryLimitError,
    getQuerySkipError,
    getIdParameterError,
    getUsernameError,
    getUserPasswordError,
    getUserRoleError
};
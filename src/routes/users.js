const { Router } = require('express');
const { User } = require('../db');
const { validateQueryLimit, validateQuerySkip, validateIdParameter } = require('../common');

const {
    ServerError,
    MongoError,
    error,
    getUsernameError,
    getUserPasswordError,
    getUserRoleError
} = require('../error');

const StatusCode = require('../status-code');
const { authenticate } = require('../auth');
const { Action, authorize } = require('../permission');
const { deleteProperties } = require('../util');

const router = Router();

router.post(
    '/',
    validatePostUser,
    authenticate,
    authorize(Action.CreateUser),
    createUser
);

router.get(
    '/',
    validateQueryLimit,
    validateQuerySkip,
    authenticate,
    authorize(Action.ListUsers),
    listUsers
);

router.get(
    '/:id',
    validateIdParameter,
    authenticate,
    authorize(Action.GetUser),
    getUser
);

router.put(
    '/:id',
    validateIdParameter,
    validatePutUser,
    authenticate,
    authorize(Action.UpdateUser),
    updateUser
);

router.delete(
    '/:id',
    validateIdParameter,
    authenticate,
    authorize(Action.DeleteUser),
    deleteUser
);

function validatePostUser(req, res, next) {
    const { username, password, role } = req.body;

    const usernameError = getUsernameError(username, true);
    if (usernameError) {
        res.status(StatusCode.BadRequest)
            .json(error(usernameError));
        return;
    }

    const passwordError = getUserPasswordError(password, true);
    if (passwordError) {
        res.status(StatusCode.BadRequest)
            .json(error(passwordError));
        return;
    }

    const roleError = getUserRoleError(role, true);
    if (roleError) {
        res.status(StatusCode.BadRequest)
            .json(error(roleError));
        return;
    }

    next();
}

async function createUser(req, res) {
    try {
        deleteProperties(req.body, ['_id', 'createdAt', 'updatedAt']);
        let user = await User.create(req.body);
        user = user.toObject();
        deleteProperties(user, ['password']);
        res.status(StatusCode.Created)
            .json({ data: { user } });
    } catch (e) {
        let code = e.code === MongoError.DuplicateKey
            ? ServerError.DuplicateKey
            : ServerError.Unexpected;

        res.status(StatusCode.InternalServerError)
            .json(error(code));
    }
}

async function listUsers(req, res) {
    try {
        const users = await User.find({}, { password: 0 })
            .skip(+req.query.skip)
            .limit(+req.query.limit);

        const totalCount = await User.estimatedDocumentCount();

        res.json({
            data: {
                users,
                totalCount
            }
        });
    } catch (e) {
        res.status(StatusCode.InternalServerError)
            .json(error(ServerError.Unexpected));
    }
}

async function getUser(req, res) {
    try {
        const user = await User.findById(req.params.id, { password: 0 });
        res.json({ data: { user } });
    } catch (e) {
        res.status(StatusCode.InternalServerError)
            .json(error(ServerError.Unexpected));
    }
}

function validatePutUser(req, res, next) {
    const { username, password, role } = req.body;

    const usernameError = getUsernameError(username);
    if (usernameError) {
        res.status(StatusCode.BadRequest)
            .json(error(usernameError));
        return;
    }

    const passwordError = getUserPasswordError(password);
    if (passwordError) {
        res.status(StatusCode.BadRequest)
            .json(error(passwordError));
        return;
    }

    const roleError = getUserRoleError(role);
    if (roleError) {
        res.status(StatusCode.BadRequest)
            .json(error(roleError));
        return;
    }

    next();
}

async function updateUser(req, res) {
    try {
        deleteProperties(req.body, ['_id', 'createdAt', 'updatedAt']);
        let user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        user = user.toObject();
        deleteProperties(user, ['password']);
        res.json({ data: { user } });
    } catch (e) {
        let code = e.code === MongoError.DuplicateKey
            ? ServerError.DuplicateKey
            : ServerError.Unexpected;

        res.status(StatusCode.InternalServerError)
            .json(error(code));
    }
}

async function deleteUser(req, res) {
    try {
        const user = await User.findByIdAndRemove(req.params.id);
        res.json({ data: { user } });
    } catch (e) {
        res.status(StatusCode.InternalServerError)
            .json(error(ServerError.Unexpected));
    }
}

module.exports = router;
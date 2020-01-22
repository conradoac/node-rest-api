const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../db');

const {
    ServerError,
    error,
    getUsernameError,
    getUserPasswordError
} = require('../error');

const StatusCode = require('../status-code');

const router = Router();

router.post(
    '/sign-in',
    validateSignIn,
    signIn
);

function validateSignIn(req, res, next) {
    const { username, password } = req.body;

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

    next();
}

async function signIn(req, res) {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            res.status(StatusCode.Unauthorized)
                .json(error(ServerError.SignInUserNotFound));
            return;
        }

        const passOk = await bcrypt.compare(password, user.password);
        if (!passOk) {
            res.status(StatusCode.Unauthorized)
                .json(error(ServerError.SignInWrongPassword));
            return;
        }

        const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
        res.json({ data: { token } });
    } catch (e) {
        res.status(StatusCode.InternalServerError)
            .json(error(ServerError.Unexpected));
    }
}

module.exports = router;
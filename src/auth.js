const jwt = require('jsonwebtoken');
const { User } = require('./db');
const { ServerError, error } = require('./error');
const StatusCode = require('./status-code');

async function authenticate(req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
        res.status(StatusCode.Unauthorized)
            .json(error(ServerError.Unauthorized));
        return;
    }

    try {
        const user = jwt.verify(token, process.env.SECRET_KEY);
        req.user = await User.findById(user._id, { password: 0 });

        if (!req.user) {
            // It is a valid token, but the user was not found.
            // Eg. User was removed.
            throw new Error(ServerError.Unauthorized);
        }

        next();
    } catch (e) {
        res.status(StatusCode.Unauthorized)
            .json(error(ServerError.Unauthorized));
    }
}

module.exports = {
    authenticate
};
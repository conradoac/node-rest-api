const StatusCode = require('./status-code');
const {
    error,
    getQueryLimitError,
    getQuerySkipError,
    getIdParameterError
} = require('./error');

function validateQueryLimit(req, res, next) {
    const limitError = getQueryLimitError(req.query.limit);
    if (limitError) {
        res.status(StatusCode.BadRequest)
            .json(error(limitError));
        return;
    }

    next();
}

function validateQuerySkip(req, res, next) {
    const skipError = getQuerySkipError(req.query.skip);
    if (skipError) {
        res.status(StatusCode.BadRequest)
            .json(error(skipError));
        return;
    }

    next();
}

function validateIdParameter(req, res, next) {
    const idParamError = getIdParameterError(req.params.id);
    if (idParamError) {
        res.status(StatusCode.BadRequest)
            .json(error(idParamError));
        return;
    }

    next();
}

module.exports = {
    validateQueryLimit,
    validateQuerySkip,
    validateIdParameter
};
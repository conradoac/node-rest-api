const { ServerError, error } = require('./error');
const StatusCode = require('./status-code');
const UserRole = require('./user-role');

const Action = {
    CreateUser: 'CreateUser',
    ListUsers: 'ListUsers',
    GetUser: 'GetUser',
    UpdateUser: 'UpdateUser',
    DeleteUser: 'DeleteUser'
    // ... add other actions here
};

// Add actions allowed for each user role here.
const permissions = {
    // Admins can perform any action.
    [UserRole.Admin]: Object.values(Action)
};

function isAllowed(role, action) {
    const actionsAllowed = permissions[role];
    if (!actionsAllowed)
        return false;
    return actionsAllowed.includes(action);
}

function authorize(action) {
    return (req, res, next) => {
        if (isAllowed(req.user.role, action)) {
            next();
            return;
        }

        res.status(StatusCode.Forbidden)
            .json(error(ServerError.NotAllowed));
    };
}

module.exports = {
    Action,
    authorize
};
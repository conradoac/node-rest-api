const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isIn } = require('validator');
const UserRole = require('./user-role');

const { Schema, model, Types } = mongoose;

const Constraints = {
    UsernameMaxLength: 100,
    UserPasswordMinLength: 6,
    UserPasswordMaxLength: 30
};

const userSchema = new Schema({
    username: {
        type: String,
        minlength: 1,
        maxlength: Constraints.UsernameMaxLength,
        trim: true,
        unique: true,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        minlength: Constraints.UserPasswordMinLength,
        maxlength: Constraints.UserPasswordMaxLength
    },
    role: {
        type: String,
        index: true,
        validate: {
            validator: v => isIn(v, Object.values(UserRole))
        }
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password'))
        return next();

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (e) {
        next(e);
    }
});

module.exports = {
    User: model('User', userSchema, 'users'),
    Constraints,
    ObjectId: Types.ObjectId
};
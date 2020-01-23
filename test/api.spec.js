/* eslint-env node, mocha, es2020 */

const path = require('path');
const dotEnv = require('dotenv');
const { expect } = require('chai');
const mongoose = require('mongoose');
const request = require('request-promise');
const { User } = require('../src/db');
const { ServerError } = require('../src/error');
const StatusCode = require('../src/status-code');

dotEnv.config({
    path: path.join(__dirname, './.env')
});

const API_URL = 'http://localhost:8080';

function listen() {
    return new Promise(resolve => {
        const server = require('../src/server');
        const port = process.env.PORT || 8080;

        server.listen(port, () => {
            resolve(server);
        });
    });
}

process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
    } finally {
        process.exit(0);
    }
});

async function post(url, body, token = null) {
    const res = await request({
        uri: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify(body),
        simple: false,
        resolveWithFullResponse: true
    });
    return { status: res.statusCode, body: JSON.parse(res.body) };
}

async function get(url, token = null) {
    const res = await request({
        uri: url,
        method: 'GET',
        headers: {
            'Authorization': token
        },
        simple: false,
        resolveWithFullResponse: true
    });
    return { status: res.statusCode, body: JSON.parse(res.body) };
}

async function put(url, body, token = null) {
    const res = await request({
        uri: url,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify(body),
        simple: false,
        resolveWithFullResponse: true
    });
    return { status: res.statusCode, body: JSON.parse(res.body) };
}

async function getToken() {
    const res = await post(`${API_URL}/auth/sign-in`, {
        username: 'tester',
        password: '123456'
    });
    return res.body.data.token;
}

describe('API', () => {
    before(async () => {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        });

        await listen();
    });

    describe('/auth', () => {
        const BASE_URL = `${API_URL}/auth`;

        describe('/sign-in', () => {
            describe('POST', () => {
                it('should respond with status code 400 (BadRequest) and error code "UsernameIsRequired" if username is missing.', async () => {
                    let res = await post(BASE_URL + '/sign-in', {});
                    expect(res.status).to.eq(StatusCode.BadRequest);
                    expect(res.body.error).to.be.an('object');
                    expect(res.body.error.code).to.eq(ServerError.UsernameIsRequired);
                });

                it('should respond with status code 400 (BadRequest) and error code "UsernameInvalid" if username have more than 100 chars.', async () => {
                    let res = await post(BASE_URL + '/sign-in', {
                        username: '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901'
                    });

                    expect(res.status).to.eq(StatusCode.BadRequest);
                    expect(res.body.error).to.be.an('object');
                    expect(res.body.error.code).to.eq(ServerError.UsernameInvalid);
                });

                it('should respond with status code 400 (BadRequest) and error code "UserPasswordIsRequired" if password is missing.', async () => {
                    let res = await post(BASE_URL + '/sign-in', {
                        username: 'conradoac'
                    });

                    expect(res.status).to.eq(StatusCode.BadRequest);
                    expect(res.body.error).to.be.an('object');
                    expect(res.body.error.code).to.eq(ServerError.UserPasswordIsRequired);
                });

                it('should respond with status code 400 (BadRequest) and error code "UserPasswordInvalid" if password does not match password constraints.', async () => {
                    let res = await post(BASE_URL + '/sign-in', {
                        username: 'conradoac',
                        password: '1'
                    });

                    expect(res.status).to.eq(StatusCode.BadRequest);
                    expect(res.body.error).to.be.an('object');
                    expect(res.body.error.code).to.eq(ServerError.UserPasswordInvalid);

                    res = await post(BASE_URL + '/sign-in', {
                        username: 'conradoac',
                        password: '1234567890123456789012345678901'
                    });

                    expect(res.status).to.eq(StatusCode.BadRequest);
                    expect(res.body.error).to.be.an('object');
                    expect(res.body.error.code).to.eq(ServerError.UserPasswordInvalid);
                });

                it('should respond with status code 401 (Unauthorized) and error code "SignInUserNotFound" if provided username does not exist.', async () => {
                    let res = await post(BASE_URL + '/sign-in', {
                        username: 'conradoac',
                        password: '1234567890'
                    });

                    expect(res.status).to.eq(StatusCode.Unauthorized);
                    expect(res.body.error).to.be.an('object');
                    expect(res.body.error.code).to.eq(ServerError.SignInUserNotFound);
                });

                it('should respond with status code 401 (Unauthorized) and error code "SignInWrongPassword" if provided password is wrong.', async () => {
                    let res = await post(BASE_URL + '/sign-in', {
                        username: 'tester',
                        password: '1234567890'
                    });

                    expect(res.status).to.eq(StatusCode.Unauthorized);
                    expect(res.body.error).to.be.an('object');
                    expect(res.body.error.code).to.eq(ServerError.SignInWrongPassword);
                });

                it('should respond with status code 200 (Ok) and a JSON object containing a data property.', async () => {
                    let res = await post(BASE_URL + '/sign-in', {
                        username: 'tester',
                        password: '123456'
                    });

                    expect(res.status).to.eq(StatusCode.Ok);
                    expect(res.body.data).to.be.an('object');
                    expect(res.body.data.token).to.be.an('string');
                });
            });
        });
    });

    describe('/users', () => {
        const BASE_URL = `${API_URL}/users`;

        describe('POST', () => {
            after(async () => {
                await User.findOneAndDelete({ username: 'conradoac' });
            });

            it('should respond with status code 400 (BadRequest) and error code "UsernameIsRequired" if username is missing.', async () => {
                let res = await post(BASE_URL, {});
                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.UsernameIsRequired);
            });

            it('should respond with status code 400 (BadRequest) and error code "UsernameInvalid" if username have more than 100 chars.', async () => {
                let res = await post(BASE_URL, {
                    username: '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901'
                });

                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.UsernameInvalid);
            });

            it('should respond with status code 400 (BadRequest) and error code "UserPasswordIsRequired" if password is missing.', async () => {
                let res = await post(BASE_URL, {
                    username: 'conradoac'
                });

                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.UserPasswordIsRequired);
            });

            it('should respond with status code 400 (BadRequest) and error code "UserPasswordInvalid" if password does not match password constraints.', async () => {
                let res = await post(BASE_URL, {
                    username: 'conradoac',
                    password: '1'
                });

                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.UserPasswordInvalid);

                res = await post(BASE_URL, {
                    username: 'conradoac',
                    password: '1234567890123456789012345678901'
                });

                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.UserPasswordInvalid);
            });

            it('should respond with status code 400 (BadRequest) and error code "UserRoleIsRequired" if role is missing.', async () => {
                let res = await post(BASE_URL, {
                    username: 'conradoac',
                    password: '123456'
                });
                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.UserRoleIsRequired);
            });

            it('should respond with status code 400 (BadRequest) and error code "UserRoleInvalid" if role does not exist.', async () => {
                let res = await post(BASE_URL, {
                    username: 'conradoac',
                    password: '123456',
                    role: 'some invalid role'
                });

                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.UserRoleInvalid);
            });

            it('should respond with status code 401 (Unauthorized) and error code "Unauthorized" if an auth token is not provided.', async () => {
                let res = await post(BASE_URL, {
                    username: 'conradoac',
                    password: '123456',
                    role: 'Admin'
                });

                expect(res.status).to.eq(StatusCode.Unauthorized);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.Unauthorized);
            });

            it('should respond with status code 401 (Unauthorized) and error code "Unauthorized" if an invalid auth token is provided.', async () => {
                let res = await post(BASE_URL, {
                    username: 'conradoac',
                    password: '123456',
                    role: 'Admin'
                }, 'some-invalid-token');

                expect(res.status).to.eq(StatusCode.Unauthorized);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.Unauthorized);
            });

            it('should respond with status code 200 (Ok) and the created user.', async () => {
                const token = await getToken();
                const res = await post(BASE_URL, {
                    username: 'conradoac',
                    password: '123456',
                    role: 'Admin'
                }, token);

                expect(res.status).to.eq(StatusCode.Created);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data.user).to.be.an('object');
                expect(res.body.data.user._id).to.be.a('string');
                expect(res.body.data.user.username).to.be.a('string');
                expect(res.body.data.user.createdAt).to.be.a('string');
                expect(res.body.data.user.updatedAt).to.be.a('string');
            });
        });

        describe('GET', () => {

            it('should respond with status code 400 (BadRequest) and error code "QueryLimitInvalid" if query limit is not number between 1 and 1000.', async () => {
                let token = await getToken();
                let res = await get(BASE_URL + '?limit=-1', token);
                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.QueryLimitInvalid);

                res = await get(BASE_URL + '?limit=abc', token);
                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.QueryLimitInvalid);

                // even if no token is provided
                res = await get(BASE_URL + '?limit=abc');
                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.QueryLimitInvalid);

                // max limit is 1000
                res = await get(BASE_URL + '?limit=1001', token);
                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.QueryLimitInvalid);
            });

            it('should respond with status code 400 (BadRequest) and error code "QuerySkipInvalid" if query skip is not a positive integer.', async () => {
                let token = await getToken();
                let res = await get(BASE_URL + '?skip=-1', token);
                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.QuerySkipInvalid);

                res = await get(BASE_URL + '?skip=abc', token);
                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.QuerySkipInvalid);

                res = await get(BASE_URL + '?skip=abc');
                expect(res.status).to.eq(StatusCode.BadRequest);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.QuerySkipInvalid);
            });

            it('should respond with status code 401 (Unauthorized) and error code "Unauthorized" if an auth token is not provided.', async () => {
                let res = await get(BASE_URL);
                expect(res.status).to.eq(StatusCode.Unauthorized);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.Unauthorized);
            });

            it('should respond with status code 401 (Unauthorized) and error code "Unauthorized" if an invalid auth token is provided.', async () => {
                let res = await get(BASE_URL, 'some-invalid-token');

                expect(res.status).to.eq(StatusCode.Unauthorized);
                expect(res.body.error).to.be.an('object');
                expect(res.body.error.code).to.eq(ServerError.Unauthorized);
            });

            it('should respond with status code 200 (Ok) and a list of users.', async () => {
                let token = await getToken();
                const res = await get(BASE_URL, token);

                expect(res.status).to.eq(StatusCode.Ok);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data.users).to.be.an('array');
                expect(res.body.data.users).to.be.an('array').that.has.length(1);
                expect(res.body.data.totalCount).to.eq(1);
            });

            it('should respond with status code 200 (Ok) and a list of users skipped by 1.', async () => {
                let token = await getToken();
                const res = await get(BASE_URL + '?skip=1', token);

                expect(res.status).to.eq(StatusCode.Ok);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data.users).to.be.an('array');
                expect(res.body.data.users).to.be.an('array').that.has.length(0);
                expect(res.body.data.totalCount).to.eq(1);
            });

            it('should respond with status code 200 (Ok) and a list of users limited by 1.', async () => {
                let token = await getToken();
                const res = await get(BASE_URL + '?limit=1', token);

                expect(res.status).to.eq(StatusCode.Ok);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data.users).to.be.an('array');
                expect(res.body.data.users).to.be.an('array').that.has.length(1);
                expect(res.body.data.totalCount).to.eq(1);
            });
        });
    });
});
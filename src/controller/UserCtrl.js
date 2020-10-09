const constants = require("../constants");
const userService = require("../service/UserService");
const {body, validationResult} = require("express-validator");
const bcrypt = require("bcrypt");

const getEmail = function (auth) {
    const tmp = auth.split(' ');
    return new Buffer.from(tmp[1], 'base64').toString().split(':')[0];
}

const getPassword = function (auth) {
    const tmp = auth.split(' ');
    return new Buffer.from(tmp[1], 'base64').toString().split(':')[1];
}

exports.validateUserData = () => {
    return [
        body("firstName").exists().isAlpha(),
        body("lastName").exists().isAlpha(),
        body("email").exists().isEmail(),
        body("password").exists().isLength({min: 8})
    ];
};

exports.createUser = (req, res) => {
    try {
        const errors = validationResult(req);
        if(!req.body || req.body === "")
        res.status(400).json({response: constants.BAD_REQUEST});
        if(validateRequestBody(req.body))
            res.status(400).json({response: constants.BAD_REQUEST});
        if (!errors.isEmpty())
            res.status(400).json({response: constants.BAD_REQUEST})

        userService
            .isUserExist(req.body.email)
            .then(data => {
                if (data.length) {
                    res.status(422);
                    res.json({response: constants.USER_ALREADY_EXIST});
                } else {
                    const user = Object.assign({}, req.body);
                    const resolve = (data) => {
                        res.status(201).json({
                            message: constants.USER_CREATION_SUCCESS,
                            user: {
                                id: data.id,
                                email: data.email,
                                firstName: data.firstName,
                                lastName: data.lastName,
                                createdAt: data.createdAt,
                                updatedAt: data.updatedAt
                            }
                        });
                    }
                    userService
                        .createUser(user)
                        .then(resolve)
                        .catch(error => {
                            res.status(400).json({response: error.message});
                        });
                }
            }).catch(error => {
            res.status(400).json({response: error.message});
        });
    } catch (error) {
        res.status(400).json({response: error.message});
    }
}

function validateRequestBody(requestBody) {
    return requestBody.hasOwnProperty('id') || requestBody.hasOwnProperty('createdAt') || requestBody.hasOwnProperty('updatedAt');
}

exports.updateUser = (req, res) => {
    try {
        const auth = req.headers['authorization'];
        if (!auth || getEmail(auth) === "" || getPassword(auth) === "")
            return res.status(401).json({response: constants.ACCESS_FORBIDDEN});
        if(!req.body || Object.keys(req.body).length === 0)
            return res.status(400).json({response: constants.BAD_REQUEST});
        if(validateRequestBody(req.body))
            return res.status(400).json({response: constants.BAD_REQUEST});
        if(getEmail(auth) !== req.body.email)
            return res.status(401).json({response: constants.ACCESS_FORBIDDEN});

        const resolve_update = (updated_record) => {
            if(updated_record[0] === 0)
                return res.status(200).json({
                    message: constants.NO_RECORD_UPDATED,
                    affected_record: updated_record[0]
                });
            return res.status(200).json({
                message: constants.UPDATE_SUCCESS,
                affected_record: updated_record[0]
            });
        }

        const resolve = (user) => {
            if (!user)
                res.status(401).json({response: constants.ACCESS_FORBIDDEN});
            bcrypt.compare(getPassword(auth), user[0].password, (err, resp) => {
                if (err)
                    return res.status(401).json({response: constants.ACCESS_FORBIDDEN});
                if (!resp)
                    return res.status(401).json({response: constants.ACCESS_FORBIDDEN});

                userService
                .updateUser(req.body)
                .then(resolve_update)
                .catch(error => {
                    res.status(400).json({response: error.message});
                });
            });

        }

        userService.isUserExist(getEmail(auth))
        .then(resolve)
        .catch(error => {
            res.status(400).json({response: error.message});
        });

    } catch (error) {
        res.status(400).json({response: error.message});
    }
}

exports.getUserInfoById = (req, res) => {
    try {
        const resolve = (user) => {
            res.status(200).json({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            });
        }
        userService
            .getUserInfoById(req.params.id)
            .then(resolve)
            .catch(error => {
                res.status(400).json({response: error.message});
            });
    } catch (error) {
        res.status(400).json({response: error.message});
    }
}

exports.getUserInfo = (req, res) => {
    try {
        const auth = req.headers['authorization'];
        if (!auth || getEmail(auth) === "" || getPassword(auth) === "")
            res.status(401).json({response: constants.ACCESS_FORBIDDEN});

        const resolve = (user) => {
            if (!user)
                res.status(401).json({response: constants.ACCESS_FORBIDDEN});
            bcrypt.compare(getPassword(auth), user[0].password, (err, resp) => {
                if (err)
                    return res.status(401).json({response: constants.ACCESS_FORBIDDEN});
                if (!resp)
                    return res.status(401).json({response: constants.ACCESS_FORBIDDEN});

                return res.status(200).json({
                    id: user[0].id,
                    firstName: user[0].firstName,
                    lastName: user[0].lastName,
                    email: user[0].email,
                    createdAt: user[0].createdAt,
                    updatedAt: user[0].updatedAt
                });
            });

        }
        userService.isUserExist(getEmail(auth))
        .then(resolve)
        .catch(error => {
            res.status(400).json({response: error.message});
        });
    } catch (error) {
        res.status(400).json({response: error.message});
    }
}

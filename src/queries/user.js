/**
 * Created by florinpopa on 31/08/2018.
 */
import {getDatabase} from './database';
import {comparePasswords} from './../utils/functions';
import config from './../utils/config';

// Credentials: {email, encryptedPassword}
export function loginUserRequest (credentials, callback) {
    let start = new Date().getTime();
    getDatabase(config.mongoCollections.user)
        .then((database) => {
            database.find({
                selector: {
                    _id: {
                        $gt: 'user.json_',
                        $lt: 'user.json_\uffff'
                    },
                    fileType: 'user.json',
                    email: credentials.email,
                    deleted: false
                }
            })
                .then((resultFind) => {
                    console.log("Result From find user: ", new Date().getTime() - start, resultFind);
                    comparePasswords(credentials.password, resultFind.docs[0].password, (error, isMatch) => {
                        if (error) {
                            console.log("Error at comparing passwords: ", error);
                            callback(error)
                        }
                        if (isMatch) {
                            console.log("Passwords match: ");
                            // Return user
                            // If passwords match, check also if the user has an active outbreak id
                            if (resultFind.docs[0].activeOutbreakId) {
                                callback(null, resultFind.docs[0]);
                            } else {
                                callback('There is no active Outbreak configured for your user. You have to configure an active Outbreak for your user from the web portal and resync the data with the hub');
                            }
                        } else {
                            console.log("Passwords don't match");
                            callback("Passwords don't match");
                        }
                    })
                })
                .catch((errorFind) => {
                    console.log("Error from find: ", errorFind);
                    callback(errorFind);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function getUserByIdRequest (userId, token, callback) {
    let start = new Date().getTime();
    getDatabase(config.mongoCollections.user)
        .then((database) => {
            database.get(userId)
                .then((result) => {
                    // console.log("GetUserByIdRequestQuery result: ", new Date().getTime() - start, result);
                    callback(null, result)
                })
                .catch((errorGetUserById) => {
                    console.log('GetUserByIdRequestQuery error: ', errorGetUserById);
                    callback(error);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function updateUserRequest (user, callback) {
    let start = new Date().getTime();
    getDatabase(config.mongoCollections.user)
        .then((database) => {
            database.put(user)
                .then((resultUpdateUser) => {
                    console.log('ResultUpdateUser: ', resultUpdateUser);
                    database.get(user._id)
                        .then((updatedUser) => {
                            console.log('Updated user: ', updatedUser);
                            callback(null, updatedUser);
                        })
                        .catch((errorUpdatedUser) => {
                            console.log('Error updated user: ');
                            return callback(errorUpdatedUser);
                        })
                })
                .catch((errorUpdateUser) => {
                    console.log('ErrorUpdateUser: ', errorUpdateUser);
                    return callback(errorUpdateUser);
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}

export function getRolesForUserRequest (roleIds, callback) {
    getDatabase(config.mongoCollections.role)
        .then((database) => {
            let roleIdsMapped = roleIds.map((e) => {
                return 'role.json_' + e
            });
            database.find({
                selector: {
                    _id: {
                        $gte: `role.json_`,
                        $lte: `role.json_\uffff`,
                        $in: roleIdsMapped,
                    },
                }
            })
                .then((result) => {
                    console.log('Result in finding roles');
                    callback(null, result.docs)
                })
                .catch((error) => {
                    console.log('Error in finding roles: ', error);
                    callback(error)
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });

}

export function getTeamsForUserRequest(callback) {
    getDatabase(config.mongoCollections.team)
        .then((database) => {
            database.find({
                selector: {
                    _id: {
                        $gte: `team.json_`,
                        $lte: `team.json_\uffff`,
                    },
                }
            })
                .then((result) => {
                    console.log('Result in finding teams');
                    callback(null, result.docs)
                })
                .catch((error) => {
                    console.log('Error in finding teams: ', error);
                    callback(error)
                })
        })
        .catch((errorGetDatabase) => {
            console.log('Error while getting database: ', errorGetDatabase);
            callback(errorGetDatabase);
        });
}
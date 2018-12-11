/**
 * Created by florinpopa on 31/08/2018.
 */
import {getDatabase} from './database';
import {comparePasswords} from './../utils/functions';

// Credentials: {email, encryptedPassword}
export function loginUserRequest (credentials, callback) {
    let database = getDatabase();

    let start = new Date().getTime();
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

    // database.query('getUserByEmail', {key: credentials.email, include_docs: true})
    //     .then((result) => {
    //         // After getting the user info, it's time to confirm that the password is correct
    //         console.log("Compare stuff: ", credentials.password, result.rows[0].doc.password);
    //         comparePasswords(credentials.password, result.rows[0].doc.password, (error, isMatch) => {
    //             if (error) {
    //                 console.log("Error at comparing passwords: ", error);
    //                 callback(error)
    //             }
    //             if (isMatch) {
    //                 console.log("Passwords match: ", result.rows[0].doc);
    //                 // Return user
    //                 callback(null, result.rows[0].doc);
    //             } else {
    //                 console.log("Passwords don't match");
    //                 callback("Passwords don't match");
    //             }
    //         })
    //     })
    //     .catch((error) => {
    //         console.log("Error when Logging locally: ", error);
    //         callback(error);
    //     })
}

export function getUserByIdRequest (userId, token, callback) {
    let database = getDatabase();

    let start = new Date().getTime();
    database.get(userId)
        .then((result) => {
            console.log("GetUserByIdRequestQuery result: ", new Date().getTime() - start, result);
            callback(null, result)
        })
        .catch((errorGetUserById) => {
            console.log('GetUserByIdRequestQuery error: ', errorGetUserById);
            callback(error);
        })
}

export function updateUserRequest (user, callback) {
    let database = getDatabase();

    // Measure the time it takes for the whole update/get process
    let start = new Date().getTime();
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
}

export function getRolesForUserRequest (roleIds, callback) {
    let database = getDatabase();

    let roleIdsMapped = roleIds.map((e) => {
        return 'role.json_' + e
    })

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
}
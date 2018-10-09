/**
 * Created by florinpopa on 31/08/2018.
 */
import {getDatabase} from './database';
import {comparePasswords} from './../utils/functions';

// Credentials: {email, encryptedPassword}
export function loginUserRequest (credentials, callback) {
    let database = getDatabase();

    // database.createIndex({
    //     index: {
    //         fields: ['fileType', 'email'],
    //         name: 'indexForLogging'
    //     }
    // })
    //     .then((result) => {
    //         console.log("Create index result: ", result);
            database.find({
                selector: {fileType: 'user.json', email: credentials.email}
            })
                .then((resultFind) => {
                    console.log("Result From find: ", resultFind);
                    comparePasswords(credentials.password, resultFind.docs[0].password, (error, isMatch) => {
                        if (error) {
                            console.log("Error at comparing passwords: ", error);
                            callback(error)
                        }
                        if (isMatch) {
                            console.log("Passwords match: ", resultFind.docs[0]);
                            // Return user
                            callback(null, resultFind.docs[0]);
                        } else {
                            console.log("Passwords don't match");
                            callback("Passwords don't match");
                        }
                    })
                })
                .catch((errorFind) => {
                    console.log("Error from find: ", errorFind);
                })
        // })
        // .catch((errorCreateIndex) => {
        //     console.log('Error while creating index: ', errorCreateIndex);
        // })

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

    database.get(userId)
        .then((result) => {
            console.log("GetUserByIdRequestQuery result: ", result);
            callback(null, result)
        })
        .catch((errorGetUserById) => {
            console.log('GetUserByIdRequestQuery error: ', errorGetUserById);
            callback(error);
        })
}
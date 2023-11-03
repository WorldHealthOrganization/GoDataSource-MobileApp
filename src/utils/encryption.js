/**
 * Created by florinpopa on 07/11/2018.
 */
import crypto from 'react-native-quick-crypto';
import {Buffer} from 'buffer';

// encryption parameters
const
    // crypto algorithm
    algorithm = 'aes-256-ctr',
    // algorithm's keylength in bytes (256 bit)
    keyLength = 32,
    // IV length in bytes
    ivLength = 16,
    // salt len in bytes for pbkdf2
    saltLength = 8,
    // digest algorithm for pbkdf2
    digest = 'sha256',
    // iterations for pbkdf2
    iterations = 10000;



/**
 * Creates key and init vector based on password
 * @param password
 * @param callback (error, encrypted buffer)
 */
function createKeyIv(password, callback) {
    // generate salt
    const salt = crypto.randomBytes(saltLength);
    // generate IV
    const iv = crypto.randomBytes(ivLength);
    // derive encryption key from password & salt
    crypto.pbkdf2(password, salt, iterations, keyLength, digest, function (err, key) {
        if (err) {
            callback(err);
        }
        callback(null, {
            salt: salt,
            key: key,
            iv: iv
        });
    });
}

/**
 * Encrypts data
 * @param password
 * @param data
 * @return {Promise<any>}
 */
export function encrypt(password, data) {
    // promisify the result
    return new Promise(function (resolve, reject) {
        // prepare encryption key & IV
        // convert from base64
        data = Buffer.from(data, 'base64');
        createKeyIv(password, function (err, key) {
            if (err) {
                return reject(err);
            }
            // encipher data
            try {
                const cipher = crypto.createCipheriv(algorithm, key.key, key.iv);
                const result = Buffer.concat([key.iv, key.salt, Buffer.from(cipher.update(data)), Buffer.from(cipher.final())]);
                resolve(result.toString('base64'));
            } catch (e) {
                console.log("Crypto error", e);
            }
        });
    });
}

/**
 * Decrypts data
 * @param password
 * @param data
 * @return {Promise<any>}
 */
export function decrypt(password, data) {
    // promisify the result
    return new Promise(function (resolve, reject) {
        // convert from base64
        const cypherText = Buffer.from(data, 'base64');
        // read IV
        const iv = cypherText.slice(0, ivLength);
        // read salt
        const salt = cypherText.slice(ivLength, ivLength + saltLength);
        // read encrypted text
        const encrypted = cypherText.slice(ivLength + saltLength);
        // derive key from password & salt
        crypto.pbkdf2(password, salt, iterations, keyLength, digest, function (err, key) {
            if (err) {
                return reject(err);
            }
            let error;
            let buffer;
            try {
                // decipher text
                const decipher = crypto.createCipheriv(algorithm, key, iv);
                buffer = Buffer.concat([Buffer.from(decipher.update(encrypted)) , Buffer.from(decipher.final())]);
            } catch (decipherError) {
                error = new Error('Failed to decrypt config properties. Stack Trace: ' + decipherError.stack);
            }
            if (error) {
                return reject(error);
            }
            resolve(buffer.toString('base64'));
        });
    });
}

export function getSyncEncryptPassword(password, clientCredentials) {
    // if a password was not provided, but client credentials were
    if (!password && clientCredentials) {
        // build the password by concatenating clientId and clientSecret
        password = clientCredentials.clientId + clientCredentials.clientSecret;
    }
    // if a password is present
    if (password) {
        // hash it
        password = sha256(password);
    }
    return password;
}

/**
 * Hexadecimal Sha256 hash
 * @param string
 * @return {string}
 */
function sha256(string){
    try {
        return crypto.createHash('sha256').update(string).digest('hex');
    } catch (e) {
        console.log("Crypto error", e);
    }
}
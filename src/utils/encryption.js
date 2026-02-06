/**
 * Created by florinpopa on 07/11/2018.
 */
import CryptoJS from 'crypto-js';
import {Buffer} from 'buffer';
import {getRandomValues} from 'react-native-get-random-values';


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
function createKeyIv(password) {
  const salt = randomBytes(saltLength);
  const iv = randomBytes(ivLength);

  const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt.toString('hex')), {
    keySize: keyLength / 4,
    iterations,
    hasher: CryptoJS.algo.SHA256,
  });

  return {
    salt,
    key: Buffer.from(key.toString(), 'hex'),
    iv,
  };
}


/**
 * Encrypts data
 * @param password
 * @param data
 * @return {Promise<any>}
 */
export function encrypt(password, data) {
  return new Promise((resolve, reject) => {
    try {
      data = Buffer.from(data, 'base64');
      const keyData = createKeyIv(password);

      const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.lib.WordArray.create(data),
        CryptoJS.enc.Hex.parse(keyData.key.toString('hex')),
        {
          iv: CryptoJS.enc.Hex.parse(keyData.iv.toString('hex')),
          mode: CryptoJS.mode.CTR,
          padding: CryptoJS.pad.NoPadding,
        }
      );

      const result = Buffer.concat([
        keyData.iv,
        keyData.salt,
        Buffer.from(encrypted.ciphertext.toString(), 'hex'),
      ]);

      resolve(result.toString('base64'));
    } catch (e) {
      reject(e);
    }
  });
}


/**
 * Decrypts data
 * @param password
 * @param data
 * @return {Promise<any>}
 */
export function decrypt(password, data) {
  return new Promise((resolve, reject) => {
    try {
      const cipherText = Buffer.from(data, 'base64');
      const iv = cipherText.slice(0, ivLength);
      const salt = cipherText.slice(ivLength, ivLength + saltLength);
      const encrypted = cipherText.slice(ivLength + saltLength);

      const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt.toString('hex')), {
        keySize: keyLength / 4,
        iterations,
        hasher: CryptoJS.algo.SHA256,
      });

      const decrypted = CryptoJS.AES.decrypt(
        {ciphertext: CryptoJS.enc.Hex.parse(encrypted.toString('hex'))},
        key,
        {
          iv: CryptoJS.enc.Hex.parse(iv.toString('hex')),
          mode: CryptoJS.mode.CTR,
          padding: CryptoJS.pad.NoPadding,
        }
      );

      const result = Buffer.from(decrypted.toString(), 'hex');
      resolve(result.toString('base64'));
    } catch (e) {
      reject(e);
    }
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
        return CryptoJS.SHA256(string).toString(CryptoJS.enc.Hex);
    } catch (e) {
        console.log("Crypto error", e);
    }
}

function randomBytes(length) {
  const arr = new Uint8Array(length);
  getRandomValues(arr);
  return Buffer.from(arr);
}
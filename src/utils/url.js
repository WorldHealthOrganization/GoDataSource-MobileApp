/**
 * Created by florinpopa on 14/06/2018.
 */
const baseUrl = 'http://whoapicd.clarisoft.com/api';


const users = baseUrl + '/users/';
const login = users + 'login';
const outbreaks = baseUrl + '/outbreaks/';
const referenceData = baseUrl + '/reference-data';

export default {
    baseUrl,
    users,
    login,
    outbreaks,
    referenceData
}
/**
 * Created by florinpopa on 03/07/2018.
 */
import user from './user';
import outbreak from './outbreak';
import cases from './cases';
import followUps from './followUps';

module.exports = Object.assign({}, user, outbreak, cases, followUps);
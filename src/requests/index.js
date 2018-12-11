/**
 * Created by florinpopa on 03/07/2018.
 */
import user from './user';
import outbreak from './outbreak';
import cases from './cases';
import followUps from './followUps';
import contacts from './contacts';
import events from './events';
import referenceData from './referenceData';
import locations from './locations';
import helpCategory from './helpCategory';
import helpItem from './helpItem';

module.exports = Object.assign({}, user, outbreak, cases, followUps, contacts, events, referenceData, locations, helpCategory, helpItem);
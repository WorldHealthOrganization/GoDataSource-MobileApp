/**
 * Created by florinpopa on 14/06/2018.
 */
import { combineReducers } from 'redux';
import app from './app';
import user from './user';
import outbreak from './outbreak';
import cases from './cases';
import followUps from './followUps';
import contacts from './contacts';
import events from './events';
import errors from './errors';
import referenceData from './referenceData';
import locations from './locations';
import role from './role';

const allReducers = combineReducers({
    app,
    user,
    outbreak,
    cases,
    followUps,
    contacts,
    events,
    errors,
    referenceData,
    locations,
    role
});

export default allReducers;
/**
 * Created by florinpopa on 14/06/2018.
 */
import { combineReducers } from 'redux';
import app from './app';
import user from './user';
import outbreak from './outbreak';
// import cases from './cases';
import followUps from './followUps';
// import contacts from './contacts';
// import events from './events';
import errors from './errors';
import referenceData from './referenceData';
import locations from './locations';
import role from './role';
import helpCategory from './helpCategory';
import helpItem from './helpItem';
import clusters from './clusters';
import teams from './teams';
// import exposure from './exposure';

const allReducers = combineReducers({
    app,
    user,
    outbreak,
    // cases,
    followUps,
    teams,
    // contacts,
    // events,
    clusters,
    helpCategory,
    helpItem,
    errors,
    referenceData,
    locations,
    role,
    // exposure
});

export default allReducers;
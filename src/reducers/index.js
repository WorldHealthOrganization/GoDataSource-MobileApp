/**
 * Created by florinpopa on 14/06/2018.
 */
import { combineReducers } from 'redux';
import app from './app';
import user from './user';
import outbreak from './outbreak';
import cases from './cases';
import followUps from './followUps';

const allReducers = combineReducers({
    app,
    user,
    outbreak,
    cases,
    followUps
});

export default allReducers;
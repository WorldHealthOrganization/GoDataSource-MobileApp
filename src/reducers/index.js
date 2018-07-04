/**
 * Created by florinpopa on 14/06/2018.
 */
import { combineReducers } from 'redux';
import app from './app';
import user from './user';

const allReducers = combineReducers({
    app,
    user
});

export default allReducers;
/**
 * Created by florinpopa on 14/06/2018.
 */
const app = require('./app');
const user = require('./user');
const outbreak = require('./outbreak');
const cases = require('./cases');
const followUps = require('./followUps');
const contacts = require('./contacts');
const errors = require('./errors');
const referenceData = require('./referenceData');
const locations = require('./locations');
const role = require('./role');
const helpCategory = require('./helpCategory');
const helpItem = require('./helpItem');

module.exports = Object.assign({}, app, user, outbreak, cases, followUps, contacts, errors, referenceData, locations, role, helpCategory, helpItem);


// /**
//  * Created by florinpopa on 20/07/2018.
//  */
// import _ from 'lodash';
// import {ACTION_TYPE_STORE_CONTACTS,
//     ACTION_TYPE_UPDATE_CONTACT,
//     ACTION_TYPE_ADD_CONTACT,
//     ACTION_TYPE_REMOVE_CONTACT } from './../utils/enums';
//
// // Do not add unnecessary business logic in the reducer. Here should only be updated the store
// export default function (state=null, action) {
//     var stateClone = null;
//     switch (action.type) {
//         case ACTION_TYPE_STORE_CONTACTS:
//             if (!action.payload) {
//                 return null;
//             }
//             // if (state) {
//             //     state = null
//             // }
//             return Object.assign([], action.payload);
//         case ACTION_TYPE_ADD_CONTACT:
//             if (!action.payload) {
//                 return null;
//             }
//             stateClone = state.slice();
//             stateClone.push(action.payload);
//             return Object.assign([], stateClone);
//         case ACTION_TYPE_UPDATE_CONTACT:
//             if (!action.payload) {
//                 return null;
//             }
//             stateClone = state.slice();
//             let itemToUpdateIndex = stateClone.map((e) => {return e._id}).indexOf(action.payload._id)
//             if (itemToUpdateIndex > -1){
//                 if (action.payload.deleted === false) {
//                     stateClone[itemToUpdateIndex] = action.payload;
//                 } else {
//                     stateClone.splice(itemToUpdateIndex, 1)
//                 }
//             }
//             return Object.assign([], stateClone);
//         case ACTION_TYPE_REMOVE_CONTACT:
//             if (!action.payload) {
//                 return null;
//             }
//             stateClone = state.slice();
//             let itemToRemoveIndex = stateClone.map((e) => {return e._id}).indexOf(action.payload._id)
//             if (itemToRemoveIndex > -1){
//                 stateClone.splice(itemToRemoveIndex, 1)
//             }
//             return Object.assign([], stateClone);
//         default:
//             break;
//     }
//     return state;
// }
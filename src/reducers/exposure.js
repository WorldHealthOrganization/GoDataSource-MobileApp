// import {
//     ACTION_TYPE_STORE_EXPOSURES,
//     ACTION_TYPE_ADD_EXPOSURE,
//     ACTION_TYPE_REMOVE_EXPOSURE,
//     ACTION_TYPE_UPDATE_EXPOSURE
// } from './../utils/enums';
//
// // Do not add unnecessary business logic in the reducer. Here should only be updated the store
// export default function (state = null, action) {
//     let stateClone = null;
//     switch (action.type) {
//         case ACTION_TYPE_STORE_EXPOSURES:
//             if (!action.payload) {
//                 return null;
//             }
//             // if (state) {
//             //     state = null
//             // }
//             return Object.assign([], action.payload);
//         case ACTION_TYPE_ADD_EXPOSURE:
//             if (!action.payload) {
//                 return null;
//             }
//             stateClone = state.slice();
//             stateClone.push(action.payload);
//             return Object.assign([], stateClone);
//         case ACTION_TYPE_UPDATE_EXPOSURE:
//             if (!action.payload) {
//                 return null;
//             }
//             stateClone = state.slice();
//             let itemToUpdateIndex = stateClone.findIndex((e) => {return e._id === action.payload._id});
//             if (itemToUpdateIndex > -1){
//                 if (action.payload.deleted === false) {
//                     stateClone[itemToUpdateIndex] = action.payload;
//                 } else {
//                     stateClone.splice(itemToUpdateIndex, 1)
//                 }
//             }
//             return Object.assign([], stateClone);
//         case ACTION_TYPE_REMOVE_EXPOSURE:
//             if (!action.payload) {
//                 return null;
//             }
//             stateClone = state.slice();
//             let itemToRemoveIndex = stateClone.findIndex((e) => {return e._id === action.payload._id});
//             if (itemToRemoveIndex > -1){
//                 stateClone.splice(itemToRemoveIndex, 1)
//             }
//             return Object.assign([], stateClone);
//         default:
//             break;
//     }
//     return state;
// }
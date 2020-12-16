// /**
//  * Created by florinpopa on 25/07/2018.
//  */
// import {ACTION_TYPE_STORE_EVENTS} from './../utils/enums';
//
// // Do not add unnecessary business logic in the reducer. Here should only be updated the store
// export default function (state=null, action) {
//     switch (action.type) {
//         case ACTION_TYPE_STORE_EVENTS:
//             if (!action.payload) {
//                 return null;
//             }
//             return Object.assign([], state, action.payload);
//         default:
//             break;
//     }
//     return state;
// }
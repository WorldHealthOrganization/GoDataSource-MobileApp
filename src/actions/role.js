

import { getRolesForUserRequest } from './../queries/user';
import { addError } from './errors';
import {ACTION_TYPE_STORE_USER_PERMISSIONS} from './../utils/enums';
import _ from 'lodash';
import errorTypes from "../utils/errorTypes";

export function storePermissions(permissions) {
    return {
        type: ACTION_TYPE_STORE_USER_PERMISSIONS,
        payload: permissions
    }
}

export function getUserRoles(userRoleIds, dispatch) {
    return new Promise((resolve, reject) => {
        getRolesForUserRequest(userRoleIds, (error, response) => {
            if (error) {
                console.log("*** getUserRoles error: ", error);
                // dispatch(addError(errorTypes.ERROR_USER_ROLES));
                reject(errorTypes.ERROR_USER_ROLES);
            }
            if (response) {
                // console.log ('getUserRoles response', response)
                let permissions = []
                let perm = response.map((e) => {
                    return e.permissionIds.map((k) => {
                        return permissions.push(k)
                    })
                })
                permissions = _.uniq(permissions);
                // dispatch(storePermissions(permissions));
                // resolve('Done permissions');
                resolve({userRoles: permissions});
            }
        })
    })
};

import {getRolesForUserRequest} from './../queries/user';
import {ACTION_TYPE_STORE_USER_PERMISSIONS} from './../utils/enums';
import _ from 'lodash';
import errorTypes from "../utils/errorTypes";

export function storePermissions(permissions) {
    return {
        type: ACTION_TYPE_STORE_USER_PERMISSIONS,
        payload: permissions
    }
}

export function getUserRoles(userRoleIds) {
    return new Promise((resolve, reject) => {
        getRolesForUserRequest(userRoleIds, (error, response) => {
            if (error) {
                console.log("*** getUserRoles error: ", error);
                reject(errorTypes.ERROR_USER_ROLES);
            }
            if (response) {
                let permissions = [];
                let perm = response.map((e) => {
                    return e.permissionIds.map((k) => {
                        return permissions.push(k)
                    })
                });
                permissions = _.uniq(permissions);
                resolve(permissions);
            }
        })
    })
};

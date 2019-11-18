import {insertOrUpdate} from './../queries/sqlTools/helperMethods';

export function insertOrUpdateExposure(exposure) {
    return insertOrUpdate('common', 'relationship', [exposure], true);
}
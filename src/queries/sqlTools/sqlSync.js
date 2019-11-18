import constants from './constants';
import {insertOrUpdate} from './helperMethods';

// The main method that is called to handle the sync for the data that can be filtered/sorted/grouped
export function sqlSync(data, table) {
    return Promise.resolve()
        .then(() => {
            let mappedData = mapDataForInsert(table, data);
        })
}
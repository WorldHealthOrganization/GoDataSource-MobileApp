
import moment from 'moment-timezone';

export function createDate(date, format, utc) {
    if (!date) {
        return moment().toDate();
    }
    if (utc) {
        return moment.utc(date).toDate();
    }
    return moment(date, format).toDate();
}

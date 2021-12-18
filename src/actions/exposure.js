import {insertOrUpdate} from './../queries/sqlTools/helperMethods';
export function insertOrUpdateExposure(exposure) {
    exposure.persons?.forEach(person=>{
        if (person.target === true){
            exposure.targetId = person.id;
            exposure.targetType = person.type;
        }
        if (person.source === true){
            exposure.sourceId = person.id;
            exposure.sourceType = person.type;
        }
    })
    return insertOrUpdate('common', 'relationship', [exposure], true);
}
/**
 * Created by florinpopa on 14/06/2018.
 */

const designScreenSize = {
    width: 375,
    height: 667
};

const sideMenuItems = [
    {
    key: 'followups',
        name: 'update',
        label: 'Follow-ups'
    },
    {
        key: 'contacts',
        name: 'people',
        label: 'Contacts'
    },
    {
        key: 'cases',
        name: 'create-new-folder',
        label: 'Cases'
    }
];

const dropDownValues = [
    {
        value: 'All'
    },
    {
        value: 'To do'
    },
    {
        value: 'Missed'
    }
];

const tabsValuesRoutes = {
    followUpsFilter: [
        {key: 'filters', title: 'FILTERS'},
        {key: 'sort', title: 'SORT'}
    ],
    followUpsSingle: [
        {key: 'genInfo', title: 'GENERAL INFO'},
        {key: 'quest', title: 'QUESTIONNAIRE'}
    ]
};


export default {
    designScreenSize,
    sideMenuItems,
    dropDownValues,
    tabsValuesRoutes
}
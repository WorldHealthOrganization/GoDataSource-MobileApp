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

const followUpsSingleScreen = {
    generalInfo: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'flagged',
                    label: 'Flagged',
                    type: 'SwitchInput',
                    value: true,
                    isRequired: false,
                    isEditMode: true,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red'
                },
                {
                    cardNumber: 1,
                    id: 'reason',
                    label: 'Reason',
                    type: 'TextInput',
                    value: 'test',
                    isRequired: true,
                    isEditMode: true,
                    multiline: true
                },
            ]
        },
        {
            fields: [
                {
                    cardNumber: 2,
                    id: 'exposedTo',
                    label: 'Exposed to (Case)',
                    type: 'DropdownInput',
                    value: '',
                    data: [{value: 'Diana Jones'}, {value: 'Florin Popa'}],
                    isRequired: false,
                    isEditMode: true,
                    isAdditive: true
                },
            ]
        },
        {
            fields: [
                {
                    cardNumber: 3,
                    id: 'date',
                    label: 'Date',
                    value: '',
                    type: "DatePicker",
                    isRequired: true,
                    isEditMode: true,
                    format: 'MM/dd/YYYY'
                },
                {
                    cardNumber: 3,
                    id: 'nextTo',
                    label: 'Is the contact next to you?',
                    type: 'SwitchInput',
                    value: true,
                    isRequired: false,
                    isEditMode: true,
                    activeButtonColor: 'green',
                    activeBackgroundColor: 'green'
                },
                {
                    cardNumber: 3,
                    id: 'address',
                    label: 'Address',
                    type: 'DropdownInput',
                    value: '',
                    data: [{value: 'Diana Jones'}, {value: 'Florin Popa'}],
                    isRequired: false,
                    isEditMode: true,
                    isAdditive: true
                }
            ]
        }
    ]
};


export default {
    designScreenSize,
    sideMenuItems,
    dropDownValues,
    tabsValuesRoutes,
    followUpsSingleScreen
}
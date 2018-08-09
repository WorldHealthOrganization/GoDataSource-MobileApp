/**
 * Created by florinpopa on 14/06/2018.
 */
import styles from './../styles';


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
                    id: 'riskLevel',
                    label: 'Risk level',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red'
                },
                {
                    cardNumber: 1,
                    id: 'riskReason',
                    label: 'Reason',
                    type: 'TextInput',
                    value: '',
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
                    value: 'Test',
                    isExposure: true,
                    isRequired: false,
                    isEditMode: false,
                    isAdditive: true
                },
                // {
                //     cardNumber: 2,
                //     id: 'date',
                //     label: 'Date',
                //     value: '',
                //     type: "DatePicker",
                //     isRequired: true,
                //     isEditMode: true,
                //     format: 'MM/dd/YYYY'
                // },
                // {
                //     cardNumber: 2,
                //     id: 'performed',
                //     label: 'Performed',
                //     type: 'SwitchInput',
                //     value: false,
                //     isRequired: false,
                //     isEditMode: true,
                //     activeButtonColor: styles.missedRedColor,
                //     activeBackgroundColor: styles.missedRedColorWithOpacity
                // },
                // {
                //     cardNumber: 2,
                //     id: 'lostToFollowUp',
                //     label: 'Lost to Follow-up',
                //     type: 'SwitchInput',
                //     value: false,
                //     isRequired: false,
                //     isEditMode: true,
                //     activeButtonColor: styles.missedRedColor,
                //     activeBackgroundColor: styles.missedRedColorWithOpacity
                // },

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
                    id: 'fillGeolocation',
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
                    data: [],
                    isRequired: false,
                    isEditMode: true,
                    isAdditive: true
                }
            ]
        }
    ]
};

const followUpsFilterScreen = {
    filter: [
        {
            fields: [
                {
                    cardNumber: 1,
                    label: 'Gender',
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.navigationDrawerSeparatorGrey
                },
                {
                    cardNumber: 1,
                    id: 'gender',
                    type: 'Selector',
                    value: '',
                    data: [{value: 'Male'}, {value: 'Female'}]
                }
            ]
        },
        {
            fields: [
                {
                    cardNumber: 2,
                    label: 'Age range',
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.navigationDrawerSeparatorGrey
                },
                {
                    cardNumber: 2,
                    id: 'age',
                    type: 'IntervalPicker',
                    value: '',
                    min: 0,
                    max: 100
                }
            ]
        },
        // {
        //     fields: [
        //         {
        //             cardNumber: 3,
        //             label: 'Location',
        //             type: 'Section',
        //             hasBorderBottom: true,
        //             borderBottomColor: styles.navigationDrawerSeparatorGrey
        //         },
        //         {
        //             cardNumber: 3,
        //             id: 'selectedLocations',
        //             type: 'DropDownSectioned',
        //             label: 'Choose one or more locations',
        //             value: '',
        //             data: [],
        //             isRequired: false,
        //             isEditMode: true,
        //         }
        //     ]
        // },
        // {
        //     fields: [
        //         {
        //             cardNumber: 4,
        //             label: 'Exposure',
        //             type: 'Section',
        //             hasBorderBottom: true,
        //             borderBottomColor: styles.navigationDrawerSeparatorGrey
        //         },
        //         {
        //             cardNumber: 4,
        //             id: 'exposure',
        //             label: 'Choose one or more cases',
        //             type: 'DropDown',
        //             value: '',
        //             data: [{value: 'Diana Jones'}, {value: 'Florin Popa'}],
        //             isRequired: false,
        //             isEditMode: true
        //         }
        //     ]
        // }
    ]
};

const defaultFilterForContacts = {
    include: [
        'relationships',
        {
            relation: 'followUps',
            scope: {
                order: 'date ASC'
            }
        }
    ]
};


export default {
    designScreenSize,
    sideMenuItems,
    dropDownValues,
    tabsValuesRoutes,
    followUpsSingleScreen,
    followUpsFilterScreen,
    defaultFilterForContacts
}
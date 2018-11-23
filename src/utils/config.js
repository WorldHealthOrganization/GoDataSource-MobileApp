/**
 * Created by florinpopa on 14/06/2018.
 */
import styles from './../styles';
import {Platform} from 'react-native';

const baseUrls = [
    {value: 'gva11sucombee.who.int:3000'},
    {value: 'whoapicd.clarisoft.com'}
];

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
        label: 'Contacts',
        // addButton: true
    },
    {
        key: 'cases',
        name: 'create-new-folder',
        label: 'Cases',
        addButton: true
    }
];

const dropDownValues = [
    {
        value: 'All'
    },
    {
        value: 'LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE_NOT_PERFORMED'
    },
    {
        value: 'LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE_SEEN_OK'
    },
    {
        value: 'LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE_SEEN_NOT_OK'
    },
    {
        value: 'LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE_MISSED'
    }
];

const tabsValuesRoutes = {
    followUpsFilter: [
        {key: 'filters', title: 'FILTERS'},
        {key: 'sort', title: 'SORT'}
    ],
    casesFilter: [
        {key: 'filters', title: 'FILTERS'},
        {key: 'sort', title: 'SORT'}
    ],
    followUpsSingle: [
        {key: 'genInfo', title: 'DETAILS'},
        {key: 'quest', title: 'QUESTIONNAIRE'}
    ],
    casesSingle: [
        {key: 'personal', title: 'PERSONAL'},
        {key: 'address', title: 'ADDRESS'},
        {key: 'infection', title: 'INFECTION'},
        {key: 'caseInvestigation', title: 'INVESTIGATION'}
    ],
    contactsSingle: [
        {key: 'personal', title: 'PERSONAL'},
        {key: 'address', title: 'ADDRESS'},
        {key: 'exposures', title: 'EXPOSURES'},
        {key: 'calendar', title: 'CALENDAR'}
    ],
    contactsAdd: [
        {key: 'personal', title: 'PERSONAL'},
        {key: 'address', title: 'ADDRESS'},
        {key: 'exposures', title: 'EXPOSURES'},
    ]
};

const followUpsSingleScreen = {
    generalInfo: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'date',
                    label: 'Date',
                    value: '',
                    type: "DatePicker",
                    isRequired: true,
                    isEditMode: true,
                    format: 'MM/dd/YYYY',
                    objectType: 'FollowUp'
                },
                {
                    cardNumber: 1,
                    id: 'statusId',
                    label: 'Status',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: true,
                    isEditMode: true,
                    objectType: 'FollowUp'
                },
                {
                    cardNumber: 1,
                    id: 'targeted',
                    label: 'Targeted',
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: true,
                    activeButtonColor: 'green',
                    activeBackgroundColor: 'green',
                    objectType: 'FollowUp'
                },
            ]
        }
    ],
    address: {
        fields: [
            {
                cardNumber: 2,
                id: 'typeId',
                label: 'Name',
                labelValue: 'test',
                type: 'DropdownInput',
                value: '',
                isRequired: true,
                isEditMode: false,
                objectType: 'Address'
            },
            {
                cardNumber: 1,
                id: 'date',
                label: 'Date',
                labelValue: 'test',
                value: '',
                type: "DatePicker",
                isRequired: false,
                isEditMode: false,
                format: 'MM/dd/YYYY',
                objectType: 'Address'
            },
            {
                cardNumber: 2,
                id: 'locationId',
                label: 'Area',
                labelValue: 'test',
                type: 'DropDownSectioned',
                value: '',
                isRequired: true,
                isEditMode: false,
                objectType: 'Address',
                single: true
            },
            {
                cardNumber: 2,
                id: 'city',
                label: 'City',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: true,
                isEditMode: false,
                multiline: true,
                objectType: 'Address'
            },
            {
                cardNumber: 2,
                id: 'postalCode',
                label: 'ZIP',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: true,
                isEditMode: false,
                multiline: true,
                objectType: 'Address'
            },
            {
                cardNumber: 2,
                id: 'addressLine1',
                label: 'Address',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: true,
                isEditMode: false,
                multiline: true,
                objectType: 'Address'
            },
        ]
    },
};

const caseSingleScreen = {
    personal: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'firstName',
                    label: 'First Name',
                    type: 'TextInput',
                    value: '',
                    isRequired: true,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'middleName',
                    label: 'Middle Name',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'lastName',
                    label: 'Last Name',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'gender',
                    label: 'Gender',
                    labelValue: '',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'phoneNumber',
                    label: 'Phone Number',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'occupation',
                    label: 'Occupation',
                    labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'ageOrDob',
                    type: 'TextSwitchSelector',
                    values: 'TextSwitchSelectorAgeOrDobValues', //switch possibilities from config file
                    selectedItemIndexForTextSwitchSelector: 'selectedItemIndexForTextSwitchSelectorForAge', //name of state parameter that will contain the selected index from values
                    isEditMode: true,
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'dob',
                    label: 'Date of birth',
                    labelValue: 'test',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: true,
                    dependsOn: 'TextSwitchSelectorAgeOrDobValues', //if depends on this switch item and it is not selected, don't display
                    format: 'MM/dd/YYYY',
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'age',
                    label: 'Age',
                    type: 'TextInputWithDropDown',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    multiline: false,
                    dependsOn: 'TextSwitchSelectorAgeOrDobValues',
                    dropDownData: 'ageUnitOfMeasureDropDown', //drop down with values
                    selectedItemIndexForAgeUnitOfMeasureDropDown: 'selectedItemIndexForAgeUnitOfMeasureDropDown', //name of state parameter that will contain the selected index from values
                    objectType: 'Case',
                    keyboardType: Platform.OS === 'ios' ? 'number-pad' : 'numeric'
                }
            ]
        },
        {
            fields: [
                {
                    cardNumber: 2,
                    id: 'riskLevel',
                    label: 'Risk level',
                    labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: true,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'dateOfReporting',
                    label: 'Date of Reporting',
                    value: '',
                    type: "DatePicker",
                    isRequired: true,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'isDateOfReportingApproximate',
                    label: 'Is Date of reporting approximate',
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: styles.missedRedColor,
                    activeBackgroundColor: styles.missedRedColorWithOpacity,
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'transferRefused',
                    label: 'Transfer Refused',
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: styles.missedRedColor,
                    activeBackgroundColor: styles.missedRedColorWithOpacity,
                    objectType: 'Case'
                },
                {
                    id: 'riskReason',
                    label: 'Reason',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    multiline: true,
                    objectType: 'Case'
                },
            ]
        },
    ],
    document: {
        fields: [
            {
                cardNumber: 3,
                id: 'type',
                label: 'Document Type',
                type: 'DropdownInput',
                value: '',
                isRequired: true,
                isEditMode: true,
                objectType: 'Documents'
            },
            {
                cardNumber: 3,
                id: 'number',
                label: 'Document Number',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: true,
                isEditMode: true,
                objectType: 'Documents'
            },
            {
                cardNumber: 3,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: ['Delete'],
                textsStyleArray: [{color: styles.missedRedColor}],
                onPressArray: [],
                objectType: 'Documents'
            }
        ]
    },
    address: {
        fields: [
            {
                cardNumber: 1,
                id: 'typeId',
                label: 'Name',
                labelValue: 'test',
                type: 'DropdownInput',
                value: '',
                isRequired: true,
                isEditMode: true,
                objectType: 'Address'
            },
            {
                cardNumber: 1,
                id: 'date',
                label: 'Date',
                labelValue: 'test',
                value: '',
                type: "DatePicker",
                isRequired: false,
                isEditMode: true,
                format: 'MM/dd/YYYY',
                objectType: 'Address'
            },
            {
                cardNumber: 1,
                id: 'locationId',
                label: 'Area',
                labelValue: 'test',
                type: 'DropDownSectioned',
                value: '',
                isRequired: true,
                isEditMode: true,
                objectType: 'Address',
                single: true
            },
            {
                cardNumber: 1,
                id: 'city',
                label: 'City',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: true,
                multiline: true,
                objectType: 'Address'
            },
            {
                cardNumber: 1,
                id: 'postalCode',
                label: 'ZIP',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: true,
                multiline: true,
                objectType: 'Address'
            },
            {
                cardNumber: 1,
                id: 'addressLine1',
                label: 'Address',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: true,
                multiline: true,
                objectType: 'Address'
            },
            // Add coordinates support
            {
                cardNumber: 1,
                id: 'lng',
                label: 'Longitude',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: true,
                multiline: false,
                objectType: 'Address',
                keyboardType: Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'
            },
            {
                cardNumber: 1,
                id: 'lat',
                label: 'Latitude',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: true,
                multiline: false,
                objectType: 'Address',
                keyboardType: Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'
            },
            {
                cardNumber: 1,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: ['Delete'],
                textsStyleArray: [{color: styles.missedRedColor}],
                onPressArray: [],
                objectType: 'Address'
            }
        ]
    },
    infection: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'classification',
                    label: 'Classification',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: true,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'dateOfOnset',
                    label: 'Date of Onset',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'isDateOfOnsetApproximate',
                    label: 'Is Date of onset approximate?',
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: styles.missedRedColor,
                    activeBackgroundColor: styles.missedRedColorWithOpacity,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'dateBecomeCase',
                    label: 'Date of Becoming case',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'dateOfInfection',
                    label: 'Date of Infection',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'outcomeId',
                    label: 'Outcome',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'dateOfOutcome',
                    label: 'Date of Outcome',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'deceased',
                    label: 'Deceased',
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: styles.missedRedColor,
                    activeBackgroundColor: styles.missedRedColorWithOpacity,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'safeBurial',
                    label: 'Was Burial Safety Performed?',
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: styles.missedRedColor,
                    activeBackgroundColor: styles.missedRedColorWithOpacity,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'dateDeceased',
                    label: 'Date of Decease',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'Case'
                },
            ]
        }
    ],
    hospitalizationDate: {
        fields: [
            {
                cardNumber: 2,
                id: 'startDate',
                label: 'From',
                type: 'DatePicker',
                value: '',
                isRequired: true,
                isEditMode: true,
                format: 'YYYY-MM-dd',
                objectType: 'HospitalizationDates'
            },
            {
                cardNumber: 2,
                id: 'endDate',
                label: 'To',
                type: 'DatePicker',
                value: '',
                isRequired: true,
                isEditMode: true,
                format: 'YYYY-MM-dd',
                objectType: 'HospitalizationDates'
            },
            {
                cardNumber: 2,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: ['Delete'],
                textsStyleArray: [{color: styles.missedRedColor}],
                onPressArray: [],
                objectType: 'HospitalizationDates'
            }
        ]
    },
    isolationDate: {
        fields: [
            {
                cardNumber: 3,
                id: 'startDate',
                label: 'From',
                type: 'DatePicker',
                value: '',
                isRequired: true,
                isEditMode: true,
                format: 'YYYY-MM-dd',
                objectType: 'IsolationDates'
            },
            {
                cardNumber: 3,
                id: 'endDate',
                label: 'To',
                type: 'DatePicker',
                value: '',
                isRequired: true,
                isEditMode: true,
                format: 'YYYY-MM-dd',
                objectType: 'IsolationDates'
            },
            {
                cardNumber: 3,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: ['Delete'],
                textsStyleArray: [{color: styles.missedRedColor}],
                onPressArray: [],
                objectType: 'IsolationDates'
            }
        ]
    },
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
                    data: [{value: 'LNG_REFERENCE_DATA_CATEGORY_GENDER_MALE'}, {value: 'LNG_REFERENCE_DATA_CATEGORY_GENDER_FEMALE'}]
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
                    max: 150
                }
            ]
        },
        {
            fields: [
                {
                    cardNumber: 3,
                    label: 'Area',
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.navigationDrawerSeparatorGrey
                },
                {
                    cardNumber: 3,
                    id: 'selectedLocations',
                    label: 'Choose one or more locations',
                    type: 'DropDownSectioned',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    single: false
                }
            ]
        }
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

const casesFilterScreen = {
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
                    data: [{value: 'LNG_REFERENCE_DATA_CATEGORY_GENDER_MALE'}, {value: 'LNG_REFERENCE_DATA_CATEGORY_GENDER_FEMALE'}]
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
                    max: 150
                }
            ]
        },
        {
            fields: [
                {
                    cardNumber: 3,
                    label: 'Classification',
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.navigationDrawerSeparatorGrey
                },
                {
                    cardNumber: 3,
                    id: 'classification',
                    label: 'Choose one or more classification',
                    type: 'DropDown',
                    value: '',
                    isRequired: false,
                    isEditMode: true
                }
            ]
        }, 
        {
            fields: [
                {
                    cardNumber: 4,
                    label: 'Area',
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.navigationDrawerSeparatorGrey
                },
                {
                    cardNumber: 4,
                    id: 'selectedLocations',
                    label: 'Choose one or more locations',
                    type: 'DropDownSectioned',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    single: false
                }
            ]
        }
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

const defaultFilterForCases = {

};

const addFollowUpScreen = [
    {
        cardNumber: 1,
        label: 'Add Follow-Ups',
        type: 'Section',
        hasBorderBottom: false,
        borderBottomColor: styles.navigationDrawerSeparatorGrey
    },
    {
        cardNumber: 1,
        id: 'contact',
        label: 'Contact',
        type: 'DropdownInput',
        value: '',
        data: [],
        isRequired: false,
        isEditMode: true,
        isAdditive: true,
        objectType: 'Contact'
    },
    {
        cardNumber: 1,
        id: 'date',
        label: 'Date',
        value: new Date,
        type: "DatePicker",
        isRequired: true,
        isEditMode: true,
        format: 'MM/dd/YYYY',
        objectType: 'FollowUp'
    },
];

const addExposureScreen = [
    {
        cardNumber: 1,
        id: 'exposure',
        label: 'Choose a case/event',
        labelValue: 'test',
        type: 'DropdownInput',
        value: '',
        data: [{value: 'Diana Jones'}, {value: 'Florin Popa'}],
        isRequired: true,
        isEditMode: true
    },
    {
        cardNumber: 1,
        id: 'contactDate',
        label: 'Date of last contact',
        value: new Date(),
        type: "DatePicker",
        isRequired: true,
        isEditMode: true,
        format: 'MM/dd/YYYY',
        objectType: 'FollowUp'
    },
    {
        cardNumber: 1,
        id: 'contactDateEstimated',
        label: 'Is Contact Date Estimated?',
        type: 'SwitchInput',
        value: false,
        isRequired: false,
        isEditMode: true,
        activeButtonColor: styles.missedRedColor,
        activeBackgroundColor: styles.missedRedColorWithOpacity
    },
    {
        cardNumber: 1,
        id: 'certaintyLevelId',
        categoryId: 'LNG_REFERENCE_DATA_CATEGORY_CERTAINTY_LEVEL',
        label: 'Certainty Level',
        labelValue: 'test',
        type: 'DropdownInput',
        value: '',
        isRequired: true,
        isEditMode: true,
        activeButtonColor: 'red',
        activeBackgroundColor: 'red',
        objectType: 'Contact'
    },
    {
        cardNumber: 1,
        id: 'exposureTypeId',
        categoryId: 'LNG_REFERENCE_DATA_CATEGORY_EXPOSURE_TYPE',
        label: 'Exposure Type',
        labelValue: 'test',
        type: 'DropdownInput',
        value: '',
        isRequired: false,
        isEditMode: true,
        activeButtonColor: 'red',
        activeBackgroundColor: 'red',
        objectType: 'Contact'
    },
    {
        cardNumber: 1,
        id: 'exposureFrequencyId',
        categoryId: "LNG_REFERENCE_DATA_CATEGORY_EXPOSURE_FREQUENCY",
        label: 'Exposure Frequency',
        labelValue: 'test',
        type: 'DropdownInput',
        value: '',
        isRequired: false,
        isEditMode: true,
        activeButtonColor: 'red',
        activeBackgroundColor: 'red',
        objectType: 'Contact'
    },
    {
        cardNumber: 1,
        id: 'exposureDurationId',
        categoryId: 'LNG_REFERENCE_DATA_CATEGORY_EXPOSURE_DURATION',
        label: 'Exposure Duration',
        labelValue: 'test',
        type: 'DropdownInput',
        value: '',
        isRequired: false,
        isEditMode: true,
        activeButtonColor: 'red',
        activeBackgroundColor: 'red',
        objectType: 'Contact'
    },
    {
        cardNumber: 1,
        id: 'socialRelationshipTypeId',
        categoryId: 'LNG_REFERENCE_DATA_CATEGORY_CONTEXT_OF_TRANSMISSION',
        label: 'Relation',
        labelValue: 'test',
        type: 'DropdownInput',
        value: '',
        isRequired: false,
        isEditMode: true,
        activeButtonColor: 'red',
        activeBackgroundColor: 'red',
        objectType: 'Contact'
    },
    {
        cardNumber: 1,
        id: 'socialRelationshipDetail',
        label: 'Relationship',
        labelValue: 'test',
        type: 'TextInput',
        value: '',
        isRequired: false,
        isEditMode: true,
        multiline: true,
        objectType: 'Contact'
    },
    {
        cardNumber: 1,
        id: 'clusterId',
        label: 'Cluster',
        labelValue: 'test',
        type: 'DropdownInput',
        value: '',
        isRequired: false,
        isEditMode: true,
        activeButtonColor: 'red',
        activeBackgroundColor: 'red',
        objectType: 'Contact'
    },
    {
        cardNumber: 1,
        id: 'comment',
        label: 'Comment',
        labelValue: 'test',
        type: 'TextInput',
        value: '',
        isRequired: false,
        isEditMode: true,
        multiline: true,
        objectType: 'Contact'
    }
];

const contactsSingleScreen = {
    personal: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'firstName',
                    label: 'First Name',
                    labelValue: 'test',
                    type: 'TextInput',
                    value: '',
                    isRequired: true,
                    isEditMode: true,
                    multiline: false,
                    objectType: 'Contact'
                },
                {
                    cardNumber: 1,
                    id: 'middleName',
                    label: 'Middle Name',
                    labelValue: 'test',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    multiline: false,
                    objectType: 'Contact'
                },
                {
                    cardNumber: 1,
                    id: 'lastName',
                    label: 'Last Name',
                    labelValue: 'test',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    multiline: false,
                    objectType: 'Contact'
                },
                {
                    cardNumber: 1,
                    id: 'gender',
                    label: 'Gender',
                    labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'Contact'
                },
                {
                    cardNumber: 1,
                    id: 'phoneNumber',
                    label: 'Phone Number',
                    labelValue: 'test',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    multiline: false,
                    objectType: 'Contact'
                },
                {
                    cardNumber: 1,
                    id: 'occupation',
                    label: 'Occupation',
                    labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'Contact'
                },
                {
                    cardNumber: 2,
                    id: 'ageOrDob',
                    type: 'TextSwitchSelector',
                    values: 'TextSwitchSelectorAgeOrDobValues', //switch possibilities from config file
                    selectedItemIndexForTextSwitchSelector: 'selectedItemIndexForTextSwitchSelectorForAge', //name of state parameter that will contain the selected index from values
                    isEditMode: true,
                    objectType: 'Contact'
                },
                {
                    cardNumber: 3,
                    id: 'dob',
                    label: 'Date of birth',
                    labelValue: 'test',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: true,
                    dependsOn: 'TextSwitchSelectorAgeOrDobValues', //if depends on this switch item and it is not selected, don't display
                    format: 'MM/dd/YYYY',
                    objectType: 'Contact'
                },
                {
                    cardNumber: 2,
                    id: 'age',
                    label: 'Age',
                    type: 'TextInputWithDropDown',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    multiline: false,
                    dependsOn: 'TextSwitchSelectorAgeOrDobValues',
                    dropDownData: 'ageUnitOfMeasureDropDown', //drop down with values
                    selectedItemIndexForAgeUnitOfMeasureDropDown: 'selectedItemIndexForAgeUnitOfMeasureDropDown', //name of state parameter that will contain the selected index from values
                    objectType: 'Contact',
                    keyboardType: Platform.OS === 'ios' ? 'number-pad' : 'numeric'
                },
                {
                    cardNumber: 3,
                    id: 'dateOfReporting',
                    label: 'Date of Reporting',
                    labelValue: 'test',
                    value: '',
                    type: "DatePicker",
                    isRequired: true,
                    isEditMode: true,
                    format: 'MM/dd/YYYY',
                    objectType: 'Contact'
                },
                {
                    cardNumber: 3,
                    id: 'isDateOfReportingApproximate',
                    label: 'Is date of reporting approximate?',
                    labelValue: 'test',
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: true,
                    activeButtonColor: 'green',
                    activeBackgroundColor: 'green',
                    objectType: 'Contact'
                },
            ]
        },
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'riskLevel',
                    label: 'Risk level',
                    labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'Contact'
                },
                {
                    cardNumber: 1,
                    id: 'riskReason',
                    label: 'Reason',
                    labelValue: 'test',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    multiline: true,
                    objectType: 'Contact'
                }
            ]
        }
    ],
    address: {
        fields: [
            {
                cardNumber: 1,
                id: 'typeId',
                label: 'Name',
                labelValue: 'test',
                type: 'DropdownInput',
                value: '',
                isRequired: true,
                isEditMode: true,
                objectType: 'Address'
            },
            {
                cardNumber: 1,
                id: 'date',
                label: 'Date',
                labelValue: 'test',
                value: '',
                type: "DatePicker",
                isRequired: false,
                isEditMode: true,
                format: 'MM/dd/YYYY',
                objectType: 'Address'
            },
            {
                cardNumber: 1,
                id: 'locationId',
                label: 'Area',
                labelValue: 'test',
                type: 'DropDownSectioned',
                value: '',
                isRequired: true,
                isEditMode: true,
                objectType: 'Address',
                single: true
            },
            {
                cardNumber: 1,
                id: 'city',
                label: 'City',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: true,
                multiline: true,
                objectType: 'Address'
            },
            {
                cardNumber: 1,
                id: 'postalCode',
                label: 'ZIP',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: true,
                multiline: true,
                objectType: 'Address'
            },
            {
                cardNumber: 1,
                id: 'addressLine1',
                label: 'Address',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: true,
                multiline: true,
                objectType: 'Address'
            },
            // Add coordinates support
            {
                cardNumber: 1,
                id: 'lng',
                label: 'Longitude',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: true,
                multiline: false,
                objectType: 'Address',
                keyboardType: Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'
            },
            {
                cardNumber: 1,
                id: 'lat',
                label: 'Latitude',
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: true,
                multiline: false,
                objectType: 'Address',
                keyboardType: Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'
            },

            {
                cardNumber: 1,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: ['Delete'],
                textsStyleArray: [{color: styles.missedRedColor}],
                onPressArray: [],
                objectType: 'Address'
            }
        ]
    }
};

const personTypes = {
    cases: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE',
    contacts: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT',
    events: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT'
};

const mongoCollections = {
    cluster: 'cluster.json',
    followUp: 'followUp.json',
    labResult: 'labResult.json',
    language: 'language.json',
    languageToken: 'languageToken.json',
    location: 'location.json',
    outbreak: 'outbreak.json',
    person: 'person.json',
    referenceData: 'referenceData.json',
    relationship: 'relationship.json',
    role: 'role.json',
    team: 'team.json',
    user: 'user.json'
};

const RNDBConfig = {
    "cluster": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "name": {
            "type": "VARCHAR(100)"
        },
        "updatedAt": {
            "type": "DATE"
        },
        "updatedBy": {
            "type": "VARCHAR(100)"
        },
        "deleted": {
            "type": "BOOLEAN"
        },
        "deletedAt": {
            "type": "DATE"
        }
    },
    "followUp": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "date": {
            "type": "DATE"
        },
        "performed": {
            "type": "BOOLEAN"
        },
        "lostToFollowUp": {
            "type": "BOOLEAN"
        },
        "outbreakId": {
            "type": "VARCHAR(100)",
            "references": "outbreak",
            "referencesOn": "_id"
        },
        "personId": {
            "type": "VARCHAR(100)",
            "references": "person",
            "referencesOn": "_id"
        },
        "updatedAt": {
            "type": "DATE"
        },
        "updatedBy": {
            "type": "VARCHAR(100)"
        },
        "deleted": {
            "type": "BOOLEAN"
        },
        "deletedAt": {
            "type": "DATE"
        }
    },
    "language": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "name": {
            "type": "VARCHAR(100)"
        },
        "deleted": {
            "type": "BOOLEAN"
        }
    },
    "languageToken": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "token": {
            "type": "VARCHAR(100)",
            "unique": true
        },
        "languageId": {
            "type": "VARCHAR(100)",
            "references": "language",
            "referencesOn": "_id"
        },
        "translation": {
            "type": "VARCHAR(100)"
        },
        "deleted": {
            "type": "BOOLEAN"
        }
    },
    "location": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "name": {
            "type": "VARCHAR(100)"
        },
        "parentLocationId": {
            "type": "VARCHAR(100)",
            "references": "language",
            "referencesOn": "_id"
        },
        "active": {
            "type": "BOOLEAN"
        },
        "deleted": {
            "type": "BOOLEAN"
        }
    },
    "outbreak": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "deleted": {
            "type": "BOOLEAN"
        }
    },
    "person": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "type": {
            "type": "VARCHAR(100)"
        },
        "outbreakId": {
            "type": "VARCHAR(100)",
            "references": "outbreak",
            "referencesOn": "_id"
        },
        "firstName": {
            "type": "VARCHAR(100)"
        },
        "middleName": {
            "type": "VARCHAR(100)"
        },
        "lastName": {
            "type": "VARCHAR(100)"
        },
        "age_years": {
            "type": "INT"
        },
        "age_months": {
            "type": "INT"
        },
        "gender": {
            "type": "VARCHAR(20)"
        },
        "occupation": {
            "type": "VARCHAR(100)"
        },
        "addresses_locationId": {
            "type": "VARCHAR(100)",
            "references": "location",
            "referencesOn": "_id",
            "manyOn": "_id"
        },
        "updatedAt": {
            "type": "DATE"
        },
        "updatedBy": {
            "type": "VARCHAR(100)",
            "references": "user",
            "referencesOn": "_id"
        },
        "deleted": {
            "type": "BOOLEAN"
        },
        "deletedAt": {
            "type": "DATE"
        }
    },
    "referenceData": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "categoryId": {
            "type": "VARCHAR(100)",
            "references": "language",
            "referencesOn": "token"
        },
        "value": {
            "type": "VARCHAR(100)",
            "references": "language",
            "referencesOn": "token"
        },
        "deleted": {
            "type": "BOOLEAN"
        }
    },
    "relationship": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "outbreakId": {
            "type": "VARCHAR(100)",
            "references": "outbreak",
            "referencesOn": "_id"
        },
        "active": {
            "type": "BOOLEAN"
        },
        "persons_0_id": {
            "type": "VARCHAR(100)",
            "references": "person",
            "referencesOn": "_id"
        },
        "persons_0_type": {
            "type": "VARCHAR(100)",
            "references": "language",
            "referencesOn": "token"
        },
        "persons_1_id": {
            "type": "VARCHAR(100)",
            "references": "person",
            "referencesOn": "_id"
        },
        "persons_1_type": {
            "type": "VARCHAR(100)",
            "references": "language",
            "referencesOn": "token"
        },
        "updatedAt": {
            "type": "DATE"
        },
        "updatedBy": {
            "type": "VARCHAR(100)",
            "references": "user",
            "referencesOn": "_id"
        },
        "deleted": {
            "type": "BOOLEAN"
        },
        "deletedAt": {
            "type": "DATE"
        }
    },
    "role": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "name": {
            "type": "VARCHAR(100)"
        },
        "deleted": {
            "type": "BOOLEAN"
        }
    },
    "team": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "name": {
            "type": "VARCHAR(100)"
        },
        "deleted": {
            "type": "BOOLEAN"
        }
    },
    "user": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "email": {
            "type": "VARCHAR(100)"
        },
        "deleted": {
            "type": "BOOLEAN"
        },
        "deletedAt": {
            "type": "DATE"
        }
    }
};

const userResidenceAddress = {
    userPlaceOfResidence: 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE_USUAL_PLACE_OF_RESIDENCE',
    userOtherResidence: 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE_PREVIOUS_USUAL_PLACE_OF_RESIDENCE'
};

const contactFollowUpStatuses = {
    underFollowUp: 'LNG_REFERENCE_DATA_CONTACT_FINAL_FOLLOW_UP_STATUS_TYPE_UNDER_FOLLOW_UP',
    followUpCompleted: 'LNG_REFERENCE_DATA_CONTACT_FINAL_FOLLOW_UP_STATUS_TYPE_FOLLOW_UP_COMPLETED',
    lostToFollowUp: 'LNG_REFERENCE_DATA_CONTACT_FINAL_FOLLOW_UP_STATUS_TYPE_LOST_TO_FOLLOW_UP'
};

const followUpStatuses = {
    notPerformed: 'LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE_NOT_PERFORMED',
    seenOk: 'LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE_SEEN_OK',
    seenNotOk: 'LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE_SEEN_NOT_OK',
    missed: 'LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE_MISSED'
};

const TextSwitchSelectorAgeOrDobValues = [
     //value must be the id of the element
    { label: 'Age', value: 'age'},
    { label: 'Date of Birth', value: 'dob'}
];

const ageUnitOfMeasureDropDown = [
    { label: 'Years', value: 'years', errorValidationMessage: 'This field must be smaller or equal to 150'},
    { label: 'Months', value: 'months', errorValidationMessage: 'This field must be smaller or equal to 11'}
];

const localTranslationTokens = {
    years: 'LNG_AGE_FIELD_LABEL_YEARS',
    months: 'LNG_AGE_FIELD_LABEL_MONTHS',
    male: 'LNG_REFERENCE_DATA_CATEGORY_GENDER_MALE',
    female: 'LNG_REFERENCE_DATA_CATEGORY_GENDER_FEMALE'
};


export default {
    designScreenSize,
    sideMenuItems,
    dropDownValues,
    tabsValuesRoutes,
    followUpsSingleScreen,
    followUpsFilterScreen,
    casesFilterScreen,
    caseSingleScreen,
    defaultFilterForContacts,
    defaultFilterForCases,
    baseUrls,
    addFollowUpScreen,
    addExposureScreen,
    contactsSingleScreen,
    personTypes,
    mongoCollections,
    RNDBConfig,
    userResidenceAddress,
    contactFollowUpStatuses,
    followUpStatuses,
    TextSwitchSelectorAgeOrDobValues,
    ageUnitOfMeasureDropDown,
    localTranslationTokens
}
/**
 * Created by florinpopa on 14/06/2018.
 */
import styles from './../styles';

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
        addButton: true
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
    casesFilter: [
        {key: 'filters', title: 'FILTERS'},
        {key: 'sort', title: 'SORT'}
    ],
    followUpsSingle: [
        {key: 'genInfo', title: 'GENERAL INFO'},
        {key: 'quest', title: 'QUESTIONNAIRE'}
    ],
    casesSingle: [
        {key: 'personal', title: 'PERSONAL'},
        {key: 'address', title: 'ADDRESS'},
        {key: 'infection', title: 'INFECTION'},
        {key: 'labData', title: 'LAB DATA'}
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
                    type: 'TextInput',
                    value: '',
                    isRequired: true,
                    isEditMode: true,
                    multiline: true,
                    objectType: 'Contact'
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
                    format: 'MM/dd/YYYY',
                    objectType: 'FollowUp'
                },
                {
                    cardNumber: 3,
                    id: 'fillGeoLocation',
                    label: 'Is the contact next to you?',
                    type: 'SwitchInput',
                    value: true,
                    isRequired: false,
                    isEditMode: true,
                    activeButtonColor: 'green',
                    activeBackgroundColor: 'green',
                    objectType: 'FollowUp'
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
                    isAdditive: true,
                    objectType: 'FollowUp'
                }
            ]
        }
    ]
};

const caseSingleScreen = {
    personal: [
        {
            fields: [
                {
                    cardNumber: 1,
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
                    cardNumber: 1,
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
                    cardNumber: 1,
                    id: 'isDateOfReportingApproximate',
                    label: 'Is Date of reporting approximate',
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: styles.missedRedColor,
                    activeBackgroundColor: styles.missedRedColorWithOpacity
                },
                {
                    cardNumber: 1,
                    id: 'transferRefused',
                    label: 'Transfer Refused',
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: styles.missedRedColor,
                    activeBackgroundColor: styles.missedRedColorWithOpacity
                },
                {
                    cardNumber: 1,
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
        {
            fields: [
                {
                    cardNumber: 2,
                    id: 'firstName',
                    label: 'First Name',
                    type: 'TextInput',
                    value: '',
                    isRequired: true,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'middleName',
                    label: 'Middle Name',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'lastName',
                    label: 'Last Name',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'gender',
                    label: 'Gender',
                    labelValue: '',
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
                    id: 'phoneNumber',
                    label: 'Phone Number',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'occupation',
                    label: 'Occupation',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'age',
                    label: 'Age',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                // {
                //     cardNumber: 1,
                //     id: 'dob',
                //     label: 'Date of Birth',
                //     value: '',
                //     type: "DatePicker",
                //     isRequired: true,
                //     isEditMode: false,
                //     format: 'YYYY-MM-dd',
                //     objectType: 'Case'
                // },
            ]
        }
    ],
    address: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'typeId',
                    label: 'Name',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: true,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'date',
                    label: 'Date',
                    value: '',
                    type: "DatePicker",
                    isRequired: true,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'locationId',
                    label: 'Area',
                    type: 'TextInput',
                    value: '',
                    isRequired: true,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'city',
                    label: 'City',
                    type: 'TextInput',
                    value: '',
                    isRequired: true,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'postalCode',
                    label: 'Zip',
                    type: 'TextInput',
                    value: '',
                    isRequired: true,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'addressLine1',
                    label: 'Address',
                    type: 'TextInput',
                    value: '',
                    isRequired: true,
                    isEditMode: false,
                    objectType: 'Case'
                },
            ]
        }
    ],
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
                    activeBackgroundColor: styles.missedRedColorWithOpacity
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
                    activeBackgroundColor: styles.missedRedColorWithOpacity
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
    labData: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'sampleIdentifier',
                    label: 'Sample Lab Id',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'dateSampleTaken',
                    label: 'Sample taken',
                    value: '',
                    type: "DatePicker",
                    isRequired: true,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'dateSampleDelivered',
                    label: 'Sample delivered to lab',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'dateTesting',
                    label: 'Testing Date',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'dateOfResult',
                    label: 'Date of the result',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'labName',
                    label: 'Lab Name',
                    labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'sampleType',
                    label: 'Sample type',
                    labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'testType',
                    label: 'Test type',
                    labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'result',
                    label: 'Result',
                    labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'notes',
                    label: 'Notes',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'status',
                    label: 'Status',
                    labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'quantitativeResult',
                    label: 'Quantitative Result',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'LabResult'
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
        {
            fields: [
                {
                    cardNumber: 4,
                    label: 'Classification',
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.navigationDrawerSeparatorGrey
                },
                {
                    cardNumber: 4,
                    id: 'classification',
                    label: 'Choose one or more classification',
                    type: 'DropDown',
                    value: '',
                    // data: [{value: 'Diana Jones'}, {value: 'Florin Popa'}],
                    isRequired: false,
                    isEditMode: true
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
        isRequired: true,
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
        isRequired: true,
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
        isRequired: true,
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
                    isRequired: true,
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
                    isRequired: true,
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
                    isRequired: true,
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
                    isRequired: true,
                    isEditMode: true,
                    multiline: false,
                    objectType: 'Contact'
                },
                {
                    cardNumber: 1,
                    id: 'occupation',
                    labelValue: 'test',
                    label: 'Occupation',
                    type: 'TextInput',
                    value: '',
                    isRequired: true,
                    isEditMode: true,
                    multiline: false,
                    objectType: 'Contact'
                },
                {
                    cardNumber: 3,
                    id: 'dob',
                    label: 'Date of birth',
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
                id: 'name',
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
                isRequired: true,
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
                isRequired: true,
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
                isRequired: true,
                isEditMode: true,
                multiline: true,
                objectType: 'Address'
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
    contactsSingleScreen
}
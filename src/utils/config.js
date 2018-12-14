/**
 * Created by florinpopa on 14/06/2018.
 */
import styles from './../styles';
import {Platform} from 'react-native';
import translations from './translations'

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
        label: translations.navigationDrawer.followUpsLabel,
    },
    {
        key: 'contacts',
        name: 'people',
        label: translations.navigationDrawer.contactsLabel,
        // addButton: true
    },
    {
        key: 'cases',
        name: 'create-new-folder',
        label: translations.navigationDrawer.casesLabel,
        addButton: true
    }
];

const dropDownValues = [
    {
        value: translations.followUpsScreenStatusFilterValues.allValue
    },
    {
        value: translations.followUpsScreenStatusFilterValues.notPerformedValue
    },
    {
        value: translations.followUpsScreenStatusFilterValues.seenOkValue
    },
    {
        value: translations.followUpsScreenStatusFilterValues.seenNotOkValue
    },
    {
        value: translations.followUpsScreenStatusFilterValues.missedValue
    }
];

const tabsValuesRoutes = {
    followUpsFilter: [
        {key: 'filters', title: translations.followUpFilter.filterTitle},
        {key: 'sort', title: translations.followUpFilter.sortTitle}
    ],
    helpFilter: [
        {key: 'filters', title: translations.followUpFilter.filterTitle},
        {key: 'sort', title: translations.followUpFilter.sortTitle}
    ],
    casesFilter: [
        {key: 'filters', title: translations.casesFilter.filterTitle},
        {key: 'sort', title: translations.casesFilter.sortTitle}
    ],
    followUpsSingle: [
        {key: 'genInfo', title: translations.followUpsSingleScreen.detailsiTitle},
        {key: 'quest', title: translations.followUpsSingleScreen.questionnaireTitle}
    ],
    helpSingle: [
        {key: 'details', title: translations.helpScreen.helpSingleScreenTab},
    ],
    casesSingle: [
        {key: 'personal', title: translations.caseSingleScreen.personalTitle},
        {key: 'address', title: translations.caseSingleScreen.addressTitle},
        {key: 'infection', title: translations.caseSingleScreen.infectionTitle},
        {key: 'caseInvestigation', title: translations.caseSingleScreen.investigationTitle}
    ],
    contactsSingle: [
        {key: 'personal', title: translations.contactSingleScreen.personalTitle},
        {key: 'address', title: translations.contactSingleScreen.addressTitle},
        {key: 'exposures', title: translations.contactSingleScreen.exposuresTitle},
        {key: 'calendar', title: translations.contactSingleScreen.calendarTitle}
    ],
    contactsAdd: [
        {key: 'personal', title: translations.contactSingleScreen.personalTitle},
        {key: 'address', title: translations.contactSingleScreen.addressTitle},
        {key: 'exposures', title: translations.contactSingleScreen.exposuresTitle},
    ]
};

const followUpsSingleScreen = {
    generalInfo: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'date',
                    label: translations.followUpsSingleScreen.date,
                    value: '',
                    type: "DatePicker",
                    isRequired: true,
                    isEditMode: false,
                    format: 'MM/dd/YYYY',
                    objectType: 'FollowUp'
                },
                {
                    cardNumber: 1,
                    id: 'statusId',
                    label: translations.followUpsSingleScreen.status,
                    type: 'DropdownInput',
                    value: '',
                    isRequired: true,
                    isEditMode: true,
                    objectType: 'FollowUp'
                },
                {
                    cardNumber: 1,
                    id: 'targeted',
                    label: translations.followUpsSingleScreen.targeted,
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
                label: translations.addressFieldLabels.name,
                labelValue: 'test',
                type: 'DropdownInput',
                value: '',
                isRequired: false,
                isEditMode: false,
                objectType: 'Address'
            },
            {
                cardNumber: 1,
                id: 'date',
                label: translations.addressFieldLabels.date,
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
                label: translations.addressFieldLabels.area,
                labelValue: 'test',
                type: 'DropDownSectioned',
                value: '',
                isRequired: false,
                isEditMode: false,
                objectType: 'Address',
                single: true
            },
            {
                cardNumber: 2,
                id: 'city',
                label: translations.addressFieldLabels.city,
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: false,
                multiline: true,
                objectType: 'Address'
            },
            {
                cardNumber: 2,
                id: 'postalCode',
                label: translations.addressFieldLabels.zip,
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: false,
                multiline: true,
                objectType: 'Address'
            },
            {
                cardNumber: 2,
                id: 'addressLine1',
                label: translations.addressFieldLabels.address,
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
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
                    label: translations.caseSingleScreen.firstNameLabel,
                    type: 'TextInput',
                    value: '',
                    isRequired: true,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'middleName',
                    label: translations.caseSingleScreen.middleNameLabel,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'lastName',
                    label: translations.caseSingleScreen.lastNameLabel,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'gender',
                    label: translations.caseSingleScreen.gender,
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
                    label: translations.caseSingleScreen.phoneNumber,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    keyboardType: Platform.OS === 'ios' ? 'number-pad' : 'numeric',
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'occupation',
                    label: translations.caseSingleScreen.occupation,
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
                    label: translations.caseSingleScreen.dateOfBirth,
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
                    label: translations.caseSingleScreen.age,
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
                    label: translations.caseSingleScreen.riskLevel,
                    labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'dateOfReporting',
                    label: translations.caseSingleScreen.dateOfReporting,
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
                    label: translations.caseSingleScreen.isDateOfReportingApproximate,
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
                    label: translations.caseSingleScreen.transferRefused,
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
                    label: translations.caseSingleScreen.riskReason,
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
                label: translations.caseSingleScreen.documentType,
                type: 'DropdownInput',
                value: '',
                isRequired: true,
                isEditMode: true,
                objectType: 'Documents'
            },
            {
                cardNumber: 3,
                id: 'number',
                label: translations.caseSingleScreen.documentNumber,
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
                textsArray: [translations.caseSingleScreen.deleteButton],
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
                label: translations.addressFieldLabels.name,
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
                label: translations.addressFieldLabels.date,
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
                label: translations.addressFieldLabels.area,
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
                label: translations.addressFieldLabels.city,
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
                label: translations.addressFieldLabels.zip,
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
                label: translations.addressFieldLabels.address,
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
                label: translations.addressFieldLabels.longitude,
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
                label: translations.addressFieldLabels.latitude,
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
                textsArray: [translations.addressFieldLabels.deleteButton],
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
                    label: translations.caseSingleScreen.classification,
                    type: 'DropdownInput',
                    value: '',
                    isRequired: true,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'dateOfOnset',
                    label: translations.caseSingleScreen.dateOfOnset,
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
                    label: translations.caseSingleScreen.isDateOfOnsetApproximate,
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
                    label: translations.caseSingleScreen.dateBecomeCase,
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
                    label: translations.caseSingleScreen.dateOfInfection,
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
                    label: translations.caseSingleScreen.outcomeId,
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'dateOfOutcome',
                    label: translations.caseSingleScreen.dateOfOutcome,
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
                    label: translations.caseSingleScreen.deceased,
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
                    label: translations.caseSingleScreen.safeBurial,
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
                    label: translations.caseSingleScreen.dateDeceased,
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
                label: translations.caseSingleScreen.hospitalisationStartDate,
                type: 'DatePicker',
                value: '',
                isEditMode: true,
                format: 'YYYY-MM-dd',
                objectType: 'HospitalizationDates'
            },
            {
                cardNumber: 2,
                id: 'endDate',
                label: translations.caseSingleScreen.hospitalisationEndDate,
                type: 'DatePicker',
                value: '',
                isEditMode: true,
                format: 'YYYY-MM-dd',
                objectType: 'HospitalizationDates'
            },
            {
                cardNumber: 2,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: [translations.caseSingleScreen.deleteButton],
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
                label: translations.caseSingleScreen.isolationStartDate,
                type: 'DatePicker',
                value: '',
                isEditMode: true,
                format: 'YYYY-MM-dd',
                objectType: 'IsolationDates'
            },
            {
                cardNumber: 3,
                id: 'endDate',
                label: translations.caseSingleScreen.isolationEndDate,
                type: 'DatePicker',
                value: '',
                isEditMode: true,
                format: 'YYYY-MM-dd',
                objectType: 'IsolationDates'
            },
            {
                cardNumber: 3,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: [translations.caseSingleScreen.deleteButton],
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
                    label: translations.followUpFilter.gender,
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
                    label: translations.followUpFilter.ageRange,
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
                    label: translations.followUpFilter.area,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.navigationDrawerSeparatorGrey
                },
                {
                    cardNumber: 3,
                    id: 'selectedLocations',
                    label: translations.followUpFilter.chooseLocationLabel,
                    type: 'DropDownSectioned',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    single: false
                }
            ]
        }
    ],
    sort: {
        fields: [
            {      
                cardNumber: 1,
                label: translations.sortTab.sortBy,
                type: 'Section',
                hasBorderBottom: true,
                borderBottomColor: styles.navigationDrawerSeparatorGrey
            },
            {
                cardNumber: 1,
                id: 'sortCriteria',
                type: 'DropdownInput',
                label: translations.sortTab.sortCriteria,
                isRequired: false,
                isEditMode: true,
                value: '',
                objectType: 'Sort'
            },
            {
                cardNumber: 1,
                id: 'sortOrder',
                type: 'DropdownInput',
                label: translations.sortTab.sortOrder,
                isRequired: false,
                isEditMode: true,
                value: '',
                objectType: 'Sort'
            },
            {
                cardNumber: 1,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: ['Delete'],
                textsStyleArray: [{color: styles.missedRedColor}],
                onPressArray: [],
                objectType: 'Sort'
            }
        ]
    }
};

const helpFilterScreen = {
    filter: [
        {
            fields: [
                {
                    cardNumber: 3,
                    label: translations.helpFilter.category,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.navigationDrawerSeparatorGrey
                },
                {
                    cardNumber: 3,
                    id: 'categories',
                    label: translations.helpFilter.chooseCategoryLabel,
                    type: 'DropDown',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    single: false
                }
            ]
        }
    ],
    sort: {
        fields: [
            {
                cardNumber: 1,
                label: translations.sortTab.sortBy,
                type: 'Section',
                hasBorderBottom: true,
                borderBottomColor: styles.navigationDrawerSeparatorGrey
            },
            {
                cardNumber: 1,
                id: 'sortCriteria',
                type: 'DropdownInput',
                label: translations.sortTab.sortCriteria,
                isRequired: false,
                isEditMode: true,
                value: '',
                objectType: 'Sort'
            },
            {
                cardNumber: 1,
                id: 'sortOrder',
                type: 'DropdownInput',
                label: translations.sortTab.sortOrder,
                isRequired: false,
                isEditMode: true,
                value: '',
                objectType: 'Sort'
            },
            {
                cardNumber: 1,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: ['Delete'],
                textsStyleArray: [{color: styles.missedRedColor}],
                onPressArray: [],
                objectType: 'Sort'
            }
        ]
    }
};

const casesFilterScreen = {
    filter: [
        {
            fields: [
                {
                    cardNumber: 1,
                    label: translations.casesFilter.gender,
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
                    label: translations.casesFilter.ageRange,
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
                    label: translations.casesFilter.classification,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.navigationDrawerSeparatorGrey
                },
                {
                    cardNumber: 3,
                    id: 'classification',
                    label: translations.casesFilter.chooseClassificationLabel,
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
                    label: translations.casesFilter.area,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.navigationDrawerSeparatorGrey
                },
                {
                    cardNumber: 4,
                    id: 'selectedLocations',
                    label: translations.casesFilter.chooseLocationLabel,
                    type: 'DropDownSectioned',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    single: false
                }
            ]
        }
    ],
    sort: {
        fields: [
            {
                cardNumber: 1,
                label: translations.sortTab.sortBy,
                type: 'Section',
                hasBorderBottom: true,
                borderBottomColor: styles.navigationDrawerSeparatorGrey
            },
            {
                cardNumber: 1,
                id: 'sortCriteria',
                type: 'DropdownInput',
                label: translations.sortTab.sortCriteria,
                isRequired: false,
                isEditMode: true,
                value: '',
                objectType: 'Sort'
            },
            {
                cardNumber: 1,
                id: 'sortOrder',
                type: 'DropdownInput',
                label: translations.sortTab.sortOrder,
                isRequired: false,
                isEditMode: true,
                value: '',
                objectType: 'Sort'
            },
            {
                cardNumber: 1,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: ['Delete'],
                textsStyleArray: [{color: styles.missedRedColor}],
                onPressArray: [],
                objectType: 'Sort'
            }
        ]
    }
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

const helpSingleScreen = {
    details: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'title',
                    label: translations.helpScreen.helpTitleLabel,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    multiline: true,
                    objectType: 'Help'
                },
                {
                    cardNumber: 1,
                    id: 'categoryId',
                    label: translations.helpScreen.helpCategoryLabel,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    multiline: true,
                    objectType: 'Help'
                },
                {
                    cardNumber: 1,
                    id: 'content',
                    label: translations.helpScreen.helpDescriptionLabel,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    multiline: true,
                    objectType: 'Help'
                },
                {
                    cardNumber: 1,
                    id: 'comment',
                    label: translations.helpScreen.helpCommentLabel,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    multiline: true,
                    objectType: 'Help'
                },
                {
                    cardNumber: 1,
                    id: 'page',
                    label: translations.helpScreen.helpPageLabel,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    multiline: true,
                    objectType: 'Help'
                },
            ]
        }
    ]
};

//not used
const addFollowUpScreen = [
    {
        cardNumber: 1,
        label: translations.addFollowUpScreen.addFollowUpLabel,
        type: 'Section',
        hasBorderBottom: false,
        borderBottomColor: styles.navigationDrawerSeparatorGrey
    },
    {
        cardNumber: 1,
        id: 'contact',
        label: translations.addFollowUpScreen.searchContactPlacehodler,
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
        label: translations.addFollowUpScreen.followUpDateLabel,
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
        label: translations.exposureScreen.chooseCaseOrEvent,
        labelValue: 'test',
        type: 'DropdownInput',
        value: '',
        isRequired: true,
        isEditMode: true,
        objectType: 'Contact'
    },
    {
        cardNumber: 1,
        id: 'contactDate',
        label: translations.exposureScreen.contactDate,
        value: new Date(),
        type: "DatePicker",
        isRequired: true,
        isEditMode: true,
        format: 'MM/dd/YYYY',
        objectType: 'Contact'
    },
    {
        cardNumber: 1,
        id: 'contactDateEstimated',
        label: translations.exposureScreen.contactDateEstimated,
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
        label: translations.exposureScreen.certaintyLevelId,
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
        label: translations.exposureScreen.exposureTypeId,
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
        label: translations.exposureScreen.exposureFrequencyId,
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
        label: translations.exposureScreen.exposureDurationId,
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
        label: translations.exposureScreen.socialRelationshipTypeId,
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
        label: translations.exposureScreen.socialRelationshipDetail,
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
        label: translations.exposureScreen.clusterId,
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
        label: translations.exposureScreen.comment,
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
                    label: translations.contactSingleScreen.firstName,
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
                    label: translations.contactSingleScreen.middleName,
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
                    label: translations.contactSingleScreen.lastName,
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
                    label: translations.contactSingleScreen.gender,
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
                    label: translations.contactSingleScreen.phoneNumber,
                    labelValue: 'test',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    multiline: false,
                    keyboardType: Platform.OS === 'ios' ? 'number-pad' : 'numeric',
                    objectType: 'Contact'
                },
                {
                    cardNumber: 1,
                    id: 'occupation',
                    label: translations.contactSingleScreen.occupation,
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
                    label: translations.contactSingleScreen.dob,
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
                    label: translations.contactSingleScreen.age,
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
                    label: translations.contactSingleScreen.dateOfReporting,
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
                    label: translations.contactSingleScreen.isDateOfReportingApproximate,
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
                    label: translations.contactSingleScreen.riskLevel,
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
                    label: translations.contactSingleScreen.riskReason,
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
                label: translations.addressFieldLabels.name,
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
                label: translations.addressFieldLabels.date,
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
                label: translations.addressFieldLabels.area,
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
                label: translations.addressFieldLabels.city,
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
                label: translations.addressFieldLabels.zip,
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
                label: translations.addressFieldLabels.address,
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
                label: translations.addressFieldLabels.longitude,
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
                label: translations.addressFieldLabels.latitude,
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
                textsArray: [translations.addressFieldLabels.deleteButton],
                textsStyleArray: [{color: styles.missedRedColor}],
                onPressArray: [],
                objectType: 'Address'
            }
        ]
    }
};

const personTypes = {
    cases: translations.personTypes.cases,
    contacts: translations.personTypes.contacts,
    events: translations.personTypes.events,
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
    helpCategory: 'helpCategory.json',
    helpItem: 'helpItem.json',
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
    "helpCategory": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "name": {
            "type": "VARCHAR(100)"
        },
        "order": {
            "type": "INT"
        },
        "description": {
            "type": "VARCHAR(100)"
        },
        "deleted": {
            "type": "BOOLEAN"
        },
        "deletedAt": {
            "type": "DATE"
        }
    },
    "helpItem": {
        "_id": {
            "type": "VARCHAR(100)",
            "pk": true
        },
        "title": {
            "type": "VARCHAR(100)"
        },
        "content": {
            "type": "VARCHAR(100)"
        },
        "categoryId": {
            "type": "VARCHAR(100)",
            "references": "language",
            "referencesOn": "token"
        },
        "approved": {
            "type": "BOOLEAN"
        },
        "deleted": {
            "type": "BOOLEAN"
        },
        "deletedAt": {
            "type": "DATE"
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
    userPlaceOfResidence: translations.userResidenceAddress.userPlaceOfResidence,
    userOtherResidence: translations.userResidenceAddress.userOtherResidence,
};

const contactFollowUpStatuses = {
    underFollowUp: translations.contactFollowUpStatuses.underFollowUp,
    followUpCompleted: translations.contactFollowUpStatuses.followUpCompleted,
    lostToFollowUp: translations.contactFollowUpStatuses.lostToFollowUp,
};

const followUpStatuses = {
    notPerformed: translations.followUpStatuses.notPerformed,
    seenOk: translations.followUpStatuses.seenOk,
    seenNotOk: translations.followUpStatuses.seenNotOk,
    missed: translations.followUpStatuses.missed,
};

const TextSwitchSelectorAgeOrDobValues = [
     //value must be the id of the element
    { label: translations.TextSwitchSelectorAgeOrDobValues.ageLabel, value: 'age'},
    { label: translations.TextSwitchSelectorAgeOrDobValues.dobLabel, value: 'dob'}
];

const ageUnitOfMeasureDropDown = [
    { label: translations.ageUnitOfMeasureDropDown.yearsLabel, value: 'years'},
    { label: translations.ageUnitOfMeasureDropDown.monthsLabel, value: 'months'}
];

const localTranslationTokens = {
    years: translations.localTranslationTokens.years,
    months: translations.localTranslationTokens.months,
    male: translations.localTranslationTokens.male,
    female: translations.localTranslationTokens.female,
};

const sortOrderDropDownItems = [
    { label: 'LNG_SIDE_FILTERS_SORT_BY_ASC_PLACEHOLDER', value: 'LNG_SIDE_FILTERS_SORT_BY_ASC_PLACEHOLDER'},
    { label: 'LNG_SIDE_FILTERS_SORT_BY_DESC_PLACEHOLDER', value: 'LNG_SIDE_FILTERS_SORT_BY_DESC_PLACEHOLDER'}
]

const sortCriteriaDropDownItems = [
    { label: 'First Name', value: 'First Name'},
    { label: 'Last Name', value: 'Last Name'}
]

const helpItemsSortCriteriaDropDownItems = [
    { label: 'Title', value: 'Title'},
    { label: 'Category', value: 'Category'}
];

const userPermissions = {
    readContact: 'read_contact',
    readCase: 'read_case',
    readFollowUp: 'read_followup',
    writeContact: 'write_contact',
    writeCase: 'write_case',
    writeFollowUp: 'write_followup',
};

export default {
    designScreenSize,
    sideMenuItems,
    dropDownValues,
    tabsValuesRoutes,
    followUpsSingleScreen,
    followUpsFilterScreen,
    helpFilterScreen,
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
    localTranslationTokens,
    sortOrderDropDownItems,
    sortCriteriaDropDownItems,
    userPermissions,
    helpSingleScreen,
    helpItemsSortCriteriaDropDownItems
}
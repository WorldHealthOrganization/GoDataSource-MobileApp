/**
 * Created by florinpopa on 14/06/2018.
 */
import styles from './../styles';
import {Platform} from 'react-native';
import translations from './translations';
import {createDate} from './../utils/functions';
import constants from './../utils/constants';

const baseUrls = [
    {value: 'gva11sucombee.who.int:3000'},
    {value: 'whoapicd.clarisoft.com'}
];

const designScreenSize = {
    width: 375,
    height: 667
};

export const sideMenuKeys = ["followups", 'contacts', 'contactsOfContacts', 'cases', 'labResults', 'events', 'users', 'help'];

const sideMenuItems = {
    [sideMenuKeys[0]]: {
        name: 'update',
        label: translations.navigationDrawer.followUpsLabel,
    },
    [sideMenuKeys[1]]: {
        name: 'people',
        label: translations.navigationDrawer.contactsLabel,
    },
    [sideMenuKeys[2]]: {
        name: 'groups',
        label: translations.contactsOfContactsScreen.contactsTitle,
        // addButton: true
    },
    [sideMenuKeys[3]]: {
        name: 'person',
        label: translations.navigationDrawer.casesLabel,
        addButton: true
    },
    [sideMenuKeys[4]]: {
        name: 'science',
        label: translations.navigationDrawer.labResultsLabel
    },
    [sideMenuKeys[5]]: {
        name: 'event',
        label: translations.navigationDrawer.eventsLabel
    }
};

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
    personFilter: [
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
    eventsFilter: [
        {key: 'filters', title: translations.eventsFilter.filterTitle},
        {key: 'sort', title: translations.eventsFilter.sortTitle}
    ],
    followUpsSingle: [
        {key: 'genInfo', title: translations.followUpsSingleScreen.detailsiTitle},
        {key: 'quest', title: translations.followUpsSingleScreen.questionnaireTitle}
    ],
    labResultsSingle: [
        {key: 'genInfo', title: translations.followUpsSingleScreen.detailsiTitle},
        {key: 'quest', title: translations.followUpsSingleScreen.questionnaireTitle}
    ],
    labResultsFilter: [
        {key: 'filters', title: translations.casesFilter.filterTitle},
        {key: 'sort', title: translations.casesFilter.sortTitle}
    ],
    labResultsFilterNoFilter: [
        {key: 'sort', title: translations.casesFilter.sortTitle}
    ],
    helpSingle: [
        {key: 'details', title: translations.helpScreen.helpSingleScreenTab},
    ],
    casesSingle: [
        {key: 'personal', title: translations.caseSingleScreen.personalTitle},
        {key: 'address', title: translations.caseSingleScreen.addressTitle},
        {key: 'infection', title: translations.caseSingleScreen.infectionTitle},
        {key: 'caseInvestigation', title: translations.followUpsSingleScreen.questionnaireTitle}
    ],
    casesSingleViewEdit: [
        {key: 'personal', title: translations.caseSingleScreen.personalTitle},
        {key: 'address', title: translations.caseSingleScreen.addressTitle},
        {key: 'infection', title: translations.caseSingleScreen.infectionTitle},
        {key: 'contacts', title: 'Contacts'},
        {key: 'exposures', title: 'Exposures'},
        {key: 'caseInvestigation', title: translations.followUpsSingleScreen.questionnaireTitle}
    ],
    eventsSingle: [
        {key: 'details', title: translations.eventSingleScreen.detailsTitle},
        {key: 'address', title: translations.eventSingleScreen.addressTitle},
        {key: 'eventInvestigation', title: translations.followUpsSingleScreen.questionnaireTitle}
    ],
    eventsSingleViewEdit: [
        {key: 'details', title: translations.eventSingleScreen.detailsTitle},
        {key: 'address', title: translations.eventSingleScreen.addressTitle},
        {key: 'contacts', title: 'Contacts'},
        {key: 'exposures', title: 'Exposures'},
        {key: 'eventInvestigation', title: translations.followUpsSingleScreen.questionnaireTitle}
    ],
    contactsSingle: [
        {key: 'personal', title: translations.contactSingleScreen.personalTitle},
        {key: 'address', title: translations.contactSingleScreen.addressTitle},
        {key: 'contacts', title: 'Contacts'},
        {key: 'exposures', title: translations.contactSingleScreen.exposuresTitle},
        {key: 'investigation', title: translations.followUpsSingleScreen.questionnaireTitle},
        {key: 'calendar', title: translations.contactSingleScreen.calendarTitle}
    ],
    contactsSingleWithoutExposures: [
        {key: 'personal', title: translations.contactSingleScreen.personalTitle},
        {key: 'address', title: translations.contactSingleScreen.addressTitle},
        {key: 'investigation', title: translations.followUpsSingleScreen.questionnaireTitle},
        {key: 'calendar', title: translations.contactSingleScreen.calendarTitle}
    ],
    contactsOfContactsSingle: [
        {key: 'personal', title: translations.contactSingleScreen.personalTitle},
        {key: 'address', title: translations.contactSingleScreen.addressTitle},
        {key: 'exposures', title: translations.contactSingleScreen.exposuresTitle}
    ],
    contactsOfContactsSingleWithoutExposures: [
        {key: 'personal', title: translations.contactSingleScreen.personalTitle},
        {key: 'address', title: translations.contactSingleScreen.addressTitle}
    ],
    contactsAdd: [
        {key: 'personal', title: translations.contactSingleScreen.personalTitle},
        {key: 'address', title: translations.contactSingleScreen.addressTitle},
        {key: 'exposures', title: translations.contactSingleScreen.exposuresTitle},
        {key: 'investigation', title: translations.followUpsSingleScreen.questionnaireTitle},
    ]
};

const addressFields = {
    fields: [
        {
            cardNumber: 1,
            id: 'typeId',
            label: translations.addressFieldLabels.name,
            labelValue: 'test',
            type: 'DropdownInput',
            categoryId: "LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE",
            value: '',
            isRequired: true,
            isAlwaysRequired: true,
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
            id: 'emailAddress',
            label: 'Email',
            type: 'TextInput',
            value: '',
            isRequired: false,
            isEditMode: true,
            objectType: 'Address'
        },
        {
            cardNumber: 1,
            id: 'phoneNumber',
            label: translations.caseSingleScreen.phoneNumber,
            type: 'TextInput',
            value: '',
            isRequired: false,
            isEditMode: true,
            keyboardType: 'phone-pad',
            objectType: 'Address'
        },
        {
            cardNumber: 1,
            id: 'locationId',
            label: translations.addressFieldLabels.area,
            labelValue: 'test',
            type: 'DropDownSectioned',
            value: '',
            isRequired: false,
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
        // Is the person next to you support
        {
            cardNumber: 1,
            id: 'geoLocationAccurate',
            label: translations.addressFieldLabels.isThePersonNextToYou,
            labelValue: 'test',
            type: 'SwitchInput',
            value: '',
            isRequired: false,
            isEditMode: true,
            activeButtonColor: styles.backgroundColor,
            activeBackgroundColor: styles.dangerColor,
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
            keyboardType: 'numeric',
            fieldId: 'geoLocation'
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
            keyboardType: 'numeric',
            fieldId: 'geoLocation'
        },
        {
            cardNumber: 1,
            id: 'deleteButton',
            type: 'ActionsBar',
            labelValue: 'test',
            textsArray: [translations.addressFieldLabels.deleteButton],
            textsStyleArray: [{color: styles.backgroundColor}],
            onPressArray: [],
            objectType: 'Address',
            iconArray: ['delete'],
            isNotField: true
        }
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
                    isAlwaysRequired: true,
                    isEditMode: false,
                    format: 'MM/dd/YYYY',
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
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'FollowUp'
                },
                {
                    cardNumber: 1,
                    id: 'statusId',
                    label: translations.followUpsSingleScreen.status,
                    type: 'DropdownInput',
                    categoryId: 'LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE',
                    value: '',
                    isEditMode: true,
                    objectType: 'FollowUp',
                    skipNone: true
                },
                {
                    cardNumber: 1,
                    id: 'fillLocation',
                    label: translations.addressFieldLabels.isThePersonNextToYou,
                    labelValue: 'test',
                    type: 'SwitchInput',
                    value: false,
                    // Makes no sense to be required as a switch input. Default is false?
                    // isRequired: true,
                    isEditMode: true,
                    activeButtonColor: styles.backgroundColor,
                    activeBackgroundColor: styles.dangerColor,
                    objectType: 'FollowUp',
                    isNotField: true
                },
            ]
        },
        {
            fields:[
                {
                    cardNumber: 3,
                    id: 'teamId',
                    label: translations.followUpsSingleScreen.team,
                    type: 'DropdownInput',
                    value: '',
                    isEditMode: true,
                    objectType: 'FollowUp',
                    skipNone: true
                },
            ]
        }
    ],
    address: addressFields
};
const labResultsSingleScreen = {
    generalInfo: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'sampleIdentifier',
                    label: translations.labResultsSingleScreen.sampleLabId,
                    value: '',
                    type: "TextInput",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'dateSampleTaken',
                    label: translations.labResultsSingleScreen.sampleTaken,
                    type: 'DatePicker',
                    value: '',
                    isEditMode: true,
                    format: 'MM/dd/YYYY',
                    objectType: 'LabResult',
                    skipNone: true
                },
                {
                    cardNumber: 1,
                    id: 'dateSampleDelivered',
                    label: translations.labResultsSingleScreen.sampleDelivered,
                    type: 'DatePicker',
                    value: false,
                    isRequired: false,
                    isEditMode: true,
                    format: 'MM/dd/YYYY',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'dateTesting',
                    label: translations.labResultsSingleScreen.dateSampleTested,
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: true,
                    format: 'MM/dd/YYYY',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'dateOfResult',
                    label: translations.labResultsSingleScreen.dateOfResult,
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: true,
                    format: 'MM/dd/YYYY',
                    objectType: 'LabResult'
                },
                {
                    cardNumber: 1,
                    id: 'labName',
                    label: translations.labResultsSingleScreen.labName,
                    value: '',
                    type: "DropdownInput",
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_LAB_NAME",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult'
                },{
                    cardNumber: 1,
                    id: 'sampleType',
                    label: translations.labResultsSingleScreen.sampleType,
                    value: '',
                    type: "DropdownInput",
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_TYPE_OF_SAMPLE",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult'
                },{
                    cardNumber: 1,
                    id: 'testType',
                    label: translations.labResultsSingleScreen.testType,
                    value: '',
                    type: "DropdownInput",
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_TYPE_OF_LAB_TEST",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult'
                },{
                    cardNumber: 1,
                    id: 'result',
                    label: translations.labResultsSingleScreen.result,
                    value: '',
                    type: "DropdownInput",
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_LAB_TEST_RESULT",
                    isEditMode: true,
                    objectType: 'LabResult',
                },{
                    cardNumber: 1,
                    id: 'testedFor',
                    label: translations.labResultsSingleScreen.testedFor,
                    value: '',
                    type: "TextInput",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult'
                },{
                    cardNumber: 1,
                    id: 'status',
                    label: translations.labResultsSingleScreen.status,
                    labelValue: '',
                    value: '',
                    type: "DropdownInput",
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_LAB_TEST_RESULT_STATUS",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult'
                },{
                    cardNumber: 1,
                    id: 'quantitativeResult',
                    label: translations.labResultsSingleScreen.quantResult,
                    labelValue: '',
                    value: '',
                    type: "TextInput",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult'
                },{
                    cardNumber: 1,
                    id: 'notes',
                    label: translations.labResultsSingleScreen.notes,
                    labelValue: '',
                    value: '',
                    type: "TextInput",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult'
                }
            ],
        },
        {
            fields:[
                {
                    cardNumber: 2,
                    id: 'sequence.hasSequence',
                    label: translations.labResultsSingleScreen.hasVariantStrain,
                    labelValue: '',
                    value: false,
                    type: "SwitchInput",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult',
                    activeButtonColor: styles.backgroundColor,
                    activeBackgroundColor: styles.dangerColor,
                },
                {
                    cardNumber: 2,
                    id: 'sequence.noSequenceReason',
                    label: translations.labResultsSingleScreen.sequenceReason,
                    labelValue: '',
                    value: '',
                    type: "TextInput",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult',
                    dependsOn: 'sequence.hasSequence',
                    dependsOnValue: false,
                    showWhenDependence: false
                },
                {
                    cardNumber: 2,
                    id: 'sequence.dateSampleSent',
                    label: translations.labResultsSingleScreen.dateSampleSentSeq,
                    labelValue: '',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult',
                    dependsOn: 'sequence.hasSequence',
                    dependsOnValue: true,
                    showWhenDependence: true,
                    format: 'MM/dd/YYYY'
                },
                {
                    cardNumber: 2,
                    id: 'sequence.labId',
                    label: translations.labResultsSingleScreen.labNameSeq,
                    labelValue: '',
                    value: '',
                    type: "DropdownInput",
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_LAB_SEQUENCE_LABORATORY",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult',
                    dependsOn: 'sequence.hasSequence',
                    dependsOnValue: true,
                    showWhenDependence: true,
                },
                {
                    cardNumber: 2,
                    id: 'sequence.dateResult',
                    label: translations.labResultsSingleScreen.dateResultSeq,
                    labelValue: '',
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult',
                    dependsOn: 'sequence.hasSequence',
                    dependsOnValue: true,
                    showWhenDependence: true,
                    format: 'MM/dd/YYYY'
                },
                {
                    cardNumber: 2,
                    id: 'sequence.resultId',
                    label: translations.labResultsSingleScreen.resultSeq,
                    labelValue: '',
                    value: '',
                    type: "DropdownInput",
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_LAB_SEQUENCE_RESULT",
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'LabResult',
                    dependsOn: 'sequence.hasSequence',
                    dependsOnValue: true,
                    showWhenDependence: true,
                }
            ]
        }
    ]
};
const labResultsFilterScreenNoContactPermission = {
    sort: {
        fields: [
            {
                cardNumber: 1,
                label: translations.sortTab.SortBy,
                type: 'Section',
                hasBorderBottom: true,
                borderBottomColor: styles.separatorColor
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
                textsStyleArray: [{color: styles.backgroundColor}],
                onPressArray: [],
                objectType: 'Sort',
                iconArray: ['delete'],
                isNotField: true
            }
        ]
    }
};
const labResultsFilterScreen = {
    filter: [
        {
            fields: [
                {
                    cardNumber: 1,
                    label: translations.labResultsFilter.personType,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.separatorColor
                },
                {
                    cardNumber: 1,
                    id: 'type',
                    type: 'Selector',
                    value: '',
                    shouldTranslate: true,
                    data: [{value: translations.personTypes.cases, selected: true}, {value: translations.personTypes.contacts, selected: true}]
                }
            ]
        }
    ],
    sort: {
        fields: [
            {
                cardNumber: 1,
                label: translations.sortTab.SortBy,
                type: 'Section',
                hasBorderBottom: true,
                borderBottomColor: styles.separatorColor
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
                textsStyleArray: [{color: styles.backgroundColor}],
                onPressArray: [],
                objectType: 'Sort',
                iconArray: ['delete'],
                isNotField: true
            }
        ]
    }
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
                    isAlwaysRequired: true,
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
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_GENDER',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'Case'
                },

                {
                    cardNumber: 2,
                    id: 'pregnancyStatus',
                    label: translations.caseSingleScreen.pregnancyStatus,
                    type: 'DropdownInput',
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_PREGNANCY_STATUS',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'Case',
                    skipNone: true
                },
                {
                    cardNumber: 1,
                    id: 'occupation',
                    label: translations.caseSingleScreen.occupation,
                    labelValue: 'test',
                    type: 'DropdownInput',
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_OCCUPATION',
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
                    objectType: 'Case',
                    fieldId: 'ageDob'
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
                    objectType: 'Case',
                    fieldId: 'ageDob'
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
                    keyboardType: 'numeric',
                    fieldId: 'ageDob'
                },
                {
                    cardNumber: 1,
                    id: 'visualId',
                    label: translations.caseSingleScreen.caseId,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 2,
                    id: 'dateOfReporting',
                    label: translations.caseSingleScreen.dateOfReporting,
                    value: '',
                    type: "DatePicker",
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
                    activeButtonColor: styles.backgroundColor,
                    activeBackgroundColor: styles.dangerColor,
                    objectType: 'Case'
                },
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
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_RISK_LEVEL",
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
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
                }
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
                categoryId: 'LNG_REFERENCE_DATA_CATEGORY_DOCUMENT_TYPE',
                value: '',
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
                isEditMode: true,
                objectType: 'Documents'
            },
            {
                cardNumber: 3,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: [translations.caseSingleScreen.deleteButton],
                textsStyleArray: [{color: styles.backgroundColor}],
                onPressArray: [],
                objectType: 'Documents',
                iconArray: ['delete'],
                fieldId: 'additional',
                isNotField: true
            }
        ]
    },
    vaccinesReceived: {
        fields: [
            {
                cardNumber: 2,
                id: 'vaccine',
                label: translations.personFilter.vaccine,
                type: 'DropdownInput',
                categoryId: 'LNG_REFERENCE_DATA_CATEGORY_VACCINE',
                value: '',
                isEditMode: true,
                objectType: 'Vaccines'
            },
            {
                cardNumber: 2,
                id: 'date',
                label: 'Vaccine date',
                labelValue: 'test',
                type: 'DatePicker',
                value: '',
                isRequired: false,
                isEditMode: true,
                objectType: 'Vaccines'
            },
            {
                cardNumber: 2,
                id: 'status',
                label: translations.personFilter.vaccineStatus,
                type: 'DropdownInput',
                categoryId: 'LNG_REFERENCE_DATA_CATEGORY_VACCINE_STATUS',
                value: '',
                isEditMode: true,
                objectType: 'Vaccines'
            },
            {
                cardNumber: 2,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: [translations.caseSingleScreen.deleteButton],
                textsStyleArray: [{color: styles.backgroundColor}],
                onPressArray: [],
                objectType: 'Vaccines',
                iconArray: ['delete'],
                isNotField: true
            }
        ]
    },
    address: addressFields,
    infection: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'classification',
                    label: translations.caseSingleScreen.classification,
                    type: 'DropdownInput',
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION',
                    value: '',
                    isEditMode: false,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'dateOfOnset',
                    label: translations.caseSingleScreen.dateOfOnset,
                    value: '',
                    type: "DatePicker",
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
                    activeButtonColor: styles.backgroundColor,
                    activeBackgroundColor: styles.dangerColor,
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
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_OUTCOME',
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
                    cardNumber: 2,
                    id: 'transferRefused',
                    label: translations.caseSingleScreen.transferRefused,
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: styles.backgroundColor,
                    activeBackgroundColor: styles.dangerColor,
                    objectType: 'Case'
                },
                // {
                //     cardNumber: 1,
                //     id: 'deceased',
                //     label: translations.caseSingleScreen.deceased,
                //     type: 'SwitchInput',
                //     value: false,
                //     isRequired: false,
                //     isEditMode: false,
                //     activeButtonColor: styles.backgroundColor,
                //     activeBackgroundColor: styles.dangerColor,
                //     objectType: 'Case'
                // },
                {
                    cardNumber: 1,
                    id: 'safeBurial',
                    label: translations.caseSingleScreen.safeBurial,
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: styles.backgroundColor,
                    activeBackgroundColor: styles.dangerColor,
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'dateOfBurial',
                    label: translations.caseSingleScreen.dateOfBurial,
                    value: '',
                    type: "DatePicker",
                    isRequired: false,
                    isEditMode: false,
                    format: 'YYYY-MM-dd',
                    objectType: 'Case'
                },
                {
                    cardNumber: 1,
                    id: 'burialLocationId',
                    label: translations.caseSingleScreen.burialLocationId,
                    labelValue: 'test',
                    type: "DropDownSectioned",
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case',
                    single: true
                },
                {
                    cardNumber: 1,
                    id: 'burialPlaceName',
                    label: translations.caseSingleScreen.burialPlaceName,
                    value: '',
                    type: "TextInput",
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Case'
                },
                // {
                //     cardNumber: 1,
                //     id: 'dateDeceased',
                //     label: translations.caseSingleScreen.dateDeceased,
                //     value: '',
                //     type: "DatePicker",
                //     isRequired: false,
                //     isEditMode: false,
                //     format: 'YYYY-MM-dd',
                //     objectType: 'Case'
                // },
            ]
        }
    ],
    dateRanges: {
        fields: [
            {
                cardNumber: 2,
                id: 'typeId',
                label: translations.caseSingleScreen.dateRangeType,
                labelValue: 'test',
                type: 'DropdownInput',
                categoryId: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_DATE_TYPE',
                value: '',
                isEditMode: true,
                isRequired: true,
                isAlwaysRequired: true,
                format: 'YYYY-MM-dd',
                objectType: 'DateRanges'
            },
            {
                cardNumber: 2,
                id: 'startDate',
                label: translations.caseSingleScreen.dateRangeStartDate,
                type: 'DatePicker',
                value: '',
                isEditMode: true,
                format: 'YYYY-MM-dd',
                objectType: 'DateRanges'
            },
            {
                cardNumber: 2,
                id: 'endDate',
                label: translations.caseSingleScreen.dateRangeEndDate,
                type: 'DatePicker',
                value: '',
                isEditMode: true,
                format: 'YYYY-MM-dd',
                objectType: 'DateRanges'
            },
            {
                cardNumber: 2,
                id: 'centerName',
                label: translations.caseSingleScreen.dateRangeCenterName,
                type: 'DropdownInput',
                categoryId: 'LNG_REFERENCE_DATA_CATEGORY_CENTRE_NAME',
                value: '',
                isRequired: false,
                isEditMode: false,
                objectType: 'DateRanges'
            },
            {
                cardNumber: 2,
                id: 'locationId',
                label: translations.caseSingleScreen.dateRangeLocation,
                labelValue: 'test',
                type: 'DropDownSectioned',
                value: '',
                isRequired: false,
                isEditMode: true,
                objectType: 'DateRanges',
                single: true
            },
            {
                cardNumber: 2,
                id: 'comments',
                label: translations.caseSingleScreen.dateRangeComments,
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: false,
                objectType: 'DateRanges',
                multiline: true
            },
            {
                cardNumber: 2,
                id: 'deleteButton',
                type: 'ActionsBar',
                labelValue: 'test',
                textsArray: [translations.caseSingleScreen.deleteButton],
                textsStyleArray: [{color: styles.backgroundColor}],
                onPressArray: [],
                objectType: 'DateRanges',
                iconArray: ['delete'],
                isNotField: true
            }
        ]
    },
};

const eventsFilterScreen = {
    filter: [

    ],
    sort: {
        fields: [
            {
                cardNumber: 1,
                label: translations.sortTab.SortBy,
                type: 'Section',
                hasBorderBottom: true,
                borderBottomColor: styles.separatorColor
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
                textsStyleArray: [{color: styles.backgroundColor}],
                onPressArray: [],
                objectType: 'Sort',
                iconArray: ['delete'],
                isNotField: true
            }
        ]
    }
}
const eventSingleScreen = {
    details: [
        {
            fields: [
                {
                    cardNumber: 1,
                    id: 'name',
                    label: translations.eventSingleScreen.nameLabel,
                    type: 'TextInput',
                    value: '',
                    isRequired: true,
                    isAlwaysRequired: true,
                    isEditMode: false,
                    objectType: 'Event'
                },
                {
                    cardNumber: 1,
                    id: 'date',
                    label: translations.eventSingleScreen.date,
                    labelValue: 'test',
                    value: '',
                    type: "DatePicker",
                    isEditMode: true,
                    format: 'MM/dd/YYYY',
                    objectType: 'Event'
                },
                {
                    cardNumber: 1,
                    id: 'dateOfReporting',
                    label: translations.eventSingleScreen.dateOfReporting,
                    labelValue: 'test',
                    value: '',
                    type: "DatePicker",
                    isEditMode: true,
                    format: 'MM/dd/YYYY',
                    objectType: 'Event'
                },
                {
                    cardNumber: 1,
                    id: 'isDateOfReportingApproximate',
                    label: translations.eventSingleScreen.isDateOfReportingApproximate,
                    type: 'SwitchInput',
                    value: false,
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: styles.backgroundColor,
                    activeBackgroundColor: styles.dangerColor,
                    objectType: 'Event'
                },
                {
                    cardNumber: 1,
                    id: 'visualId',
                    label: translations.eventSingleScreen.eventId,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Event'
                },
                {
                    cardNumber: 1,
                    id: 'description',
                    label: translations.eventSingleScreen.description,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    objectType: 'Event'
                },
            ]
        }
    ],
    address:{
            fields: [
                {
                    cardNumber: 1,
                    id: 'typeId',
                    label: translations.addressFieldLabels.name,
                    labelValue: 'test',
                    type: 'DropdownInput',
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE',
                    value: '',
                    isRequired: true,
                    isAlwaysRequired: true,
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
                    id: 'phoneNumber',
                    label: translations.caseSingleScreen.phoneNumber,
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    keyboardType: 'phone-pad',
                    objectType: 'Address'
                },
                {
                    cardNumber: 1,
                    id: 'emailAddress',
                    label: 'Email',
                    type: 'TextInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'Address'
                },
                {
                    cardNumber: 1,
                    id: 'locationId',
                    label: translations.addressFieldLabels.area,
                    labelValue: 'test',
                    type: 'DropDownSectioned',
                    value: '',
                    isRequired: false,
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
                // Is the person next to you support
                {
                    cardNumber: 1,
                    id: 'geoLocationAccurate',
                    label: translations.addressFieldLabels.isThePersonNextToYou,
                    labelValue: 'test',
                    type: 'SwitchInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    activeButtonColor: styles.backgroundColor,
                    activeBackgroundColor: styles.dangerColor,
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
                    keyboardType: 'numeric',
                    fieldId: 'geoLocation'
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
                    keyboardType: 'numeric',
                    fieldId: 'geoLocation'
                }
            ]
        }
}

const personFilterScreen = {
    filter: [
        {
            fields: [
                {
                    cardNumber: 1,
                    label: translations.followUpFilter.gender,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.separatorColor
                },
                {
                    cardNumber: 1,
                    id: 'gender',
                    type: 'Selector',
                    shouldTranslate: true,
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
                    borderBottomColor: styles.separatorColor
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
                    borderBottomColor: styles.separatorColor
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
        },
        {
            fields: [
                {
                    cardNumber: 4,
                    label: translations.personFilter.vaccine,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.separatorColor
                },{
                    cardNumber: 4,
                    id: 'vaccines',
                    label: translations.personFilter.vaccine,
                    type: 'DropDown',
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_VACCINE",
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    single: false
                }
            ]
        },
        {
            fields: [
                {
                    cardNumber: 5,
                    label: translations.personFilter.vaccineStatus,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.separatorColor
                },{
                    cardNumber: 5,
                    id: 'vaccineStatuses',
                    label: translations.personFilter.vaccineStatus,
                    type: 'DropDown',
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_VACCINE_STATUS',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    single: false
                }
            ]
        },
        {
            fields: [
                {
                    cardNumber: 6,
                    label: translations.personFilter.pregnancyStatus,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.separatorColor
                },{
                    cardNumber: 6,
                    id: 'pregnancyStatuses',
                    label: translations.personFilter.pregnancyStatus,
                    type: 'DropDown',
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_PREGNANCY_STATUS',
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
                label: translations.sortTab.SortBy,
                type: 'Section',
                hasBorderBottom: true,
                borderBottomColor: styles.separatorColor
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
                textsStyleArray: [{color: styles.backgroundColor}],
                onPressArray: [],
                objectType: 'Sort',
                iconArray: ['delete'],
                isNotField: true
            }
        ]
    }
};

const contactFilterScreen = {
    filter:[
        ...personFilterScreen.filter,
        {
            fields: [
                {
                    cardNumber: 7,
                    label: translations.followUpFilter.dayOfFollowUp,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.separatorColor
                },
                {
                    cardNumber: 7,
                    id: 'selectedIndexDay',
                    label: translations.followUpFilter.dayOfFollowUp,
                    type: 'IntervalPicker',
                    allowOverlap: true,
                    value: '',
                    min: 0,
                    max: 150,
                    isRequired: false,
                    isEditMode: true,
                    single: false
                }
            ]
        }
        ],
    sort: {
        ...personFilterScreen.sort
    }
}

const followUpsFilterScreen = {
    filter: [
        {
            fields: [
                {
                    cardNumber: 1,
                    label: translations.followUpFilter.gender,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.separatorColor
                },
                {
                    cardNumber: 1,
                    id: 'gender',
                    type: 'Selector',
                    shouldTranslate: true,
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
                    borderBottomColor: styles.separatorColor
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
                    borderBottomColor: styles.separatorColor
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
        },
        {
            fields: [
                {
                    cardNumber: 4,
                    label: translations.followUpFilter.dayOfFollowUp,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.separatorColor
                },
                {
                    cardNumber: 4,
                    id: 'selectedIndexDay',
                    label: translations.followUpFilter.dayOfFollowUp,
                    type: 'IntervalPicker',
                    allowOverlap: true,
                    value: '',
                    min: 0,
                    max: 150,
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
                label: translations.sortTab.SortBy,
                type: 'Section',
                hasBorderBottom: true,
                borderBottomColor: styles.separatorColor
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
                textsStyleArray: [{color: styles.backgroundColor}],
                onPressArray: [],
                objectType: 'Sort',
                iconArray: ['delete'],
                isNotField: true
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
                    borderBottomColor: styles.separatorColor
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
                label: translations.sortTab.SortBy,
                type: 'Section',
                hasBorderBottom: true,
                borderBottomColor: styles.separatorColor
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
                textsStyleArray: [{color: styles.backgroundColor}],
                onPressArray: [],
                objectType: 'Sort',
                iconArray: ['delete'],
                isNotField: true
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
                    borderBottomColor: styles.separatorColor
                },
                {
                    cardNumber: 1,
                    id: 'gender',
                    type: 'Selector',
                    shouldTranslate: true,
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
                    borderBottomColor: styles.separatorColor
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
                    borderBottomColor: styles.separatorColor
                },
                {
                    cardNumber: 3,
                    id: 'classification',
                    label: translations.casesFilter.chooseClassificationLabel,
                    type: 'DropDown',
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_CASE_CLASSIFICATION",
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
                    borderBottomColor: styles.separatorColor
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
        },
        {
            fields: [
                {
                    cardNumber: 5,
                    label: translations.personFilter.vaccine,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.separatorColor
                },{
                    cardNumber: 5,
                    id: 'vaccines',
                    label: translations.personFilter.vaccine,
                    type: 'DropDown',
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_VACCINE",
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    single: false
                }
            ]
        },
        {
            fields: [
                {
                    cardNumber: 6,
                    label: translations.personFilter.vaccineStatus,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.separatorColor
                },{
                    cardNumber: 6,
                    id: 'vaccineStatuses',
                    label: translations.personFilter.vaccineStatus,
                    type: 'DropDown',
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_VACCINE_STATUS',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    single: false
                }
            ]
        },
        {
            fields: [
                {
                    cardNumber: 7,
                    label: translations.personFilter.pregnancyStatus,
                    type: 'Section',
                    hasBorderBottom: true,
                    borderBottomColor: styles.separatorColor
                },{
                    cardNumber: 7,
                    id: 'pregnancyStatuses',
                    label: translations.personFilter.pregnancyStatus,
                    type: 'DropDown',
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_PREGNANCY_STATUS',
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
                label: translations.sortTab.SortBy,
                type: 'Section',
                hasBorderBottom: true,
                borderBottomColor: styles.separatorColor
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
                textsStyleArray: [{color: styles.backgroundColor}],
                onPressArray: [],
                objectType: 'Sort',
                iconArray: ['delete'],
                isNotField: true
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
                    label: translations.helpScreen.helpDescriptionLabel,
                    type: 'Section',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    multiline: true,
                    objectType: 'Help'
                },
                {
                    cardNumber: 1,
                    id: 'content',
                    type: 'WebView',
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
        borderBottomColor: styles.separatorColor
    },
    {
        cardNumber: 1,
        id: 'contact',
        label: translations.addFollowUpScreen.searchContactPlacehodler,
        type: 'DropdownInput',
        value: '',
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
        isAlwaysRequired: true,
        isEditMode: true,
        format: 'MM/dd/YYYY',
        objectType: 'FollowUp'
    },
];

const addRelationshipScreen = [
    {
        cardNumber: 1,
        id: 'exposure',
        label: translations.exposureScreen.chooseCaseOrEvent,
        labelValue: 'test',
        type: 'SearchableDropdown',
        value: '',
        isRequired: true,
        isAlwaysRequired: true,
        isEditMode: true,
        objectType: 'Exposure',
        isNotField: true
    },
    {
        cardNumber: 1,
        id: 'dateOfFirstContact',
        label: translations.exposureScreen.dateOfFirstContact,
        value: createDate(null),
        type: "DatePicker",
        isRequired: false,
        isEditMode: true,
        format: 'MM/dd/YYYY',
        objectType: 'Exposure'
    },
    {
        cardNumber: 1,
        id: 'contactDate',
        label: translations.exposureScreen.contactDate,
        value: createDate(null),
        type: "DatePicker",
        isRequired: true,
        isAlwaysRequired: true,
        isEditMode: true,
        format: 'MM/dd/YYYY',
        objectType: 'Exposure'
    },
    {
        cardNumber: 1,
        id: 'contactDateEstimated',
        label: translations.exposureScreen.contactDateEstimated,
        type: 'SwitchInput',
        value: false,
        isRequired: false,
        isEditMode: true,
        activeButtonColor: styles.backgroundColor,
        activeBackgroundColor: styles.dangerColor,
        objectType: 'Exposure'
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
        objectType: 'Exposure'
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
        objectType: 'Exposure'
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
        objectType: 'Exposure'
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
        objectType: 'Exposure'
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
        objectType: 'Exposure'
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
        objectType: 'Exposure'
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
        objectType: 'Exposure'
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
        objectType: 'Exposure'
    }
];

const contactsOfContactsPersonal = [
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
                isAlwaysRequired: true,
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
                categoryId: 'LNG_REFERENCE_DATA_CATEGORY_GENDER',
                value: '',
                isRequired: false,
                isEditMode: true,
                objectType: 'Contact'
            },
            {
                cardNumber: 1,
                id: 'pregnancyStatus',
                label: translations.caseSingleScreen.pregnancyStatus,
                type: 'DropdownInput',
                categoryId: 'LNG_REFERENCE_DATA_CATEGORY_PREGNANCY_STATUS',
                value: '',
                isRequired: false,
                isEditMode: false,
                activeButtonColor: 'red',
                activeBackgroundColor: 'red',
                objectType: 'Contact',
                skipNone: true
            },
            {
                cardNumber: 1,
                id: 'occupation',
                label: translations.contactSingleScreen.occupation,
                labelValue: 'test',
                type: 'DropdownInput',
                categoryId: 'LNG_REFERENCE_DATA_CATEGORY_OCCUPATION',
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
                objectType: 'Contact',
                fieldId: 'ageDob'
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
                objectType: 'Contact',
                fieldId: 'ageDob'
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
                keyboardType: 'numeric',
                fieldId: 'ageDob'
            },
            {
                cardNumber: 3,
                id: 'dateOfReporting',
                label: translations.contactSingleScreen.dateOfReporting,
                labelValue: 'test',
                value: '',
                type: "DatePicker",
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
            {
                cardNumber: 1,
                id: 'visualId',
                label: translations.contactSingleScreen.contactId,
                labelValue: 'test',
                type: 'TextInput',
                value: '',
                isRequired: false,
                isEditMode: true,
                multiline: false,
                objectType: 'Contact'
            }
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
                categoryId: "LNG_REFERENCE_DATA_CATEGORY_RISK_LEVEL",
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
                    isAlwaysRequired: true,
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
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_GENDER',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'Contact'
                },
                {
                    cardNumber: 1,
                    id: 'pregnancyStatus',
                    label: translations.caseSingleScreen.pregnancyStatus,
                    type: 'DropdownInput',
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_PREGNANCY_STATUS',
                    value: '',
                    isRequired: false,
                    isEditMode: false,
                    activeButtonColor: 'red',
                    activeBackgroundColor: 'red',
                    objectType: 'Contact',
                    skipNone: true
                },
                {
                    cardNumber: 1,
                    id: 'occupation',
                    label: translations.contactSingleScreen.occupation,
                    labelValue: 'test',
                    type: 'DropdownInput',
                    categoryId: 'LNG_REFERENCE_DATA_CATEGORY_OCCUPATION',
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
                    objectType: 'Contact',
                    fieldId: 'ageDob'
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
                    objectType: 'Contact',
                    fieldId: 'ageDob'
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
                    keyboardType: 'numeric',
                    fieldId: 'ageDob'
                },
                {
                    cardNumber: 3,
                    id: 'dateOfReporting',
                    label: translations.contactSingleScreen.dateOfReporting,
                    labelValue: 'test',
                    value: '',
                    type: "DatePicker",
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
                {
                    cardNumber: 1,
                    id: 'visualId',
                    label: translations.contactSingleScreen.contactId,
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
                    id: 'followUp.status',
                    label: translations.contactSingleScreen.followUpFinalStatus,
                    labelValue: 'test',
                    type: 'DropdownInput',
                    categoryId: 'LNG_REFERENCE_DATA_CONTACT_FINAL_FOLLOW_UP_STATUS_TYPE',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'Contact',
                    skipNone: true
                },
                {
                    cardNumber: 1,
                    id: 'followUpTeamId',
                    label: translations.contactSingleScreen.followUpTeamId,
                    // labelValue: 'test',
                    type: 'DropdownInput',
                    value: '',
                    isRequired: false,
                    isEditMode: true,
                    objectType: 'Contact',
                    permissionsList: [constants.PERMISSIONS_TEAMS.teamAll, constants.PERMISSIONS_TEAMS.teamList]
                }
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
                    categoryId: "LNG_REFERENCE_DATA_CATEGORY_RISK_LEVEL",
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
    address: addressFields,
    relationship: {
        fields: [
            {
                cardNumber: 1,
                id: 'exposure',
                label: translations.exposureScreen.chooseCaseOrEvent,
                labelValue: 'test',
                type: 'SearchableDropdown',
                value: '',
                isRequired: true,
                isAlwaysRequired: true,
                isEditMode: true,
                objectType: 'Exposure',
                isNotField: true
            },
            {
                cardNumber: 1,
                id: 'dateOfFirstContact',
                label: translations.exposureScreen.dateOfFirstContact,
                value: createDate(null),
                type: "DatePicker",
                isRequired: false,
                isEditMode: true,
                format: 'MM/dd/YYYY',
                objectType: 'Exposure'
            },
            {
                cardNumber: 1,
                id: 'contactDate',
                label: translations.exposureScreen.contactDate,
                value: createDate(null),
                type: "DatePicker",
                isRequired: true,
                isAlwaysRequired: true,
                isEditMode: true,
                format: 'MM/dd/YYYY',
                objectType: 'Exposure'
            },
            {
                cardNumber: 1,
                id: 'contactDateEstimated',
                label: translations.exposureScreen.contactDateEstimated,
                type: 'SwitchInput',
                value: false,
                isRequired: false,
                isEditMode: true,
                activeButtonColor: styles.backgroundColor,
                activeBackgroundColor: styles.dangerColor,
                objectType: 'Exposure'
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
                objectType: 'Exposure'
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
                objectType: 'Exposure'
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
                objectType: 'Exposure'
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
                objectType: 'Exposure'
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
                objectType: 'Exposure'
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
                objectType: 'Exposure'
            },
            {
                cardNumber: 1,
                id: 'clusterId',
                label: translations.exposureScreen.clusterId,
                labelValue: 'test',
                type: 'DropdownInput',
                categoryId: '',
                value: '',
                isRequired: false,
                isEditMode: true,
                activeButtonColor: 'red',
                activeBackgroundColor: 'red',
                objectType: 'Exposure'
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
                objectType: 'Exposure'
            }
        ]
    }
};

const personTypes = {
    cases: translations.personTypes.cases,
    contacts: translations.personTypes.contacts,
    events: translations.personTypes.events,
    contactsOfContacts: translations.personTypes.contactsOfContacts
};

const mongoCollections = {
    cluster: 'cluster',
    followUp: 'followUp',
    labResult: 'labResult',
    language: 'language',
    languageToken: 'languageToken',
    location: 'location',
    outbreak: 'outbreak',
    person: 'person',
    referenceData: 'referenceData',
    relationship: 'relationship',
    role: 'role',
    team: 'team',
    helpCategory: 'helpCategory',
    helpItem: 'helpItem',
    user: 'user',
    common: 'common'
};

const changingMongoCollections = [
    // 'labResult',
    'user'
];

const changingSQLiteCollections = [
    'followUp',
    'labResult',
    'person',
    'relationship'
];

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
    notAttempted: translations.followUpStatuses.notAttempted
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
    { value: translations.sortTab.sortOrderAsc },
    { value: translations.sortTab.sortOrderDesc }
];

const sortCriteriaDropDownItems = [
    { value: translations.sortTab.sortFirstName },
    { value: translations.sortTab.sortLastName  },
    { value: translations.sortTab.sortVisualId  },
    { value: translations.sortTab.sortCreatedAt  },
    { value: translations.sortTab.sortUpdatedAt  },
];

const eventSortCriteriaDropDownItems = [
    { value: translations.sortTab.sortName },
    { value: translations.sortTab.sortCreatedAt  },
    { value: translations.sortTab.sortUpdatedAt  },
]

const helpItemsSortCriteriaDropDownItems = [
    { value: translations.sortTab.sortCategory},
    { value: translations.sortTab.sortTitle}
];

const userPermissions = {
    readContact: 'read_contact',
    readCase: 'read_case',
    readEvent: 'read_event',
    readFollowUp: 'read_followup',
    writeContact: 'write_contact',
    writeCase: 'write_case',
    writeEvent: 'write_event',
    writeFollowUp: 'write_followup',
};

const caseFieldsForHardCodeCheck = {
    outcomeIdDeceasedValue: 'LNG_REFERENCE_DATA_CATEGORY_OUTCOME_DECEASED',
};

const manualSyncStages = [
    {id: 'getData', name: 'Get local changes', status: '...'},
    {id: 'createFile', name: 'Create files for sync', status: '...'},
    {id: 'sendData', name: 'Send data to the hub', status: '...'},
    {id: 'getDataFromServer', name: 'Get updated data', status: '...'},
    {id: 'testApi', name: 'Test API', status: '...'},
    {id: 'downloadDatabase', name: 'Download database', status: '...'},
    {id: 'unzipFile', name: 'Unzip', status: '...'},
    {id: 'sync', name: 'Sync', status: '...'}
];

const dateRangeTypes = {
    hospitalization: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_DATE_TYPE_HOSPITALIZATION',
    isolation: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_DATE_TYPE_ISOLATION',
    incubation: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_DATE_TYPE_INCUBATION',
    other: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_DATE_TYPE_OTHER'
};

const documentTypes = {
    archivedId: 'LNG_REFERENCE_DATA_CATEGORY_DOCUMENT_TYPE_ARCHIVED_ID'
};

const caseBlueprint = {
    riskLevel: '',
    dateOfReporting: null,
    isDateOfReportingApproximate: false,
    transferRefused: false,
    riskReason: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    phoneNumber: '',
    occupation: '',
    outcomeId: '',
    dob: null,
    age: {
        years: 0,
        months: 0
    },
    classification: '',
    dateBecomeCase: null,
    dateOfInfection: null,
    dateOfOutcome: null,
    dateOfOnset: null,
    isDateOfOnsetApproximate: false,
    deceased: false,
    dateDeceased: null,
    addresses: [
        {
            typeId: userResidenceAddress.userPlaceOfResidence,
            country: '',
            city: '',
            addressLine1: '',
            addressLine2: '',
            postalCode: '',
            locationId: '',
            // geoLocation: {
            //     coordinates: ['', ''],
            //     type: 'Point'
            // },
            date: createDate(null)
        }
    ],
    documents: [],
    dateRanges: [],
    // hospitalizationDates: [],
    // isolationDates: [],
    questionnaireAnswers: {}
};

const statusPendingWipe = 'LNG_DEVICE_WIPE_STATUS_PENDING';

const rawSQLQueryString = 'SELECT json, doc_id as _id from `by-sequence`';

const rawSQLQueryWhereString = ' WHERE doc_id LIKE ?';

const whocdCredentials = {
    name: 'test',
    hubUrl: 'http://whonewui.clarisoft.com/api',
    clientId: 'test',
    clientSecret: 'test',
    userEmail: 'andrei.postelnicu@clarisoft.com',
    encryptedConnection: false,
    numberOfData: 5000
};

export default {
    designScreenSize,
    sideMenuItems,
    dropDownValues,
    tabsValuesRoutes,
    followUpsSingleScreen,
    followUpsFilterScreen,
    labResultsSingleScreen,
    labResultsFilterScreen,
    helpFilterScreen,
    casesFilterScreen,
    contactFilterScreen,
    caseSingleScreen,
    eventsFilterScreen,
    eventSingleScreen,
    defaultFilterForContacts,
    defaultFilterForCases,
    baseUrls,
    addFollowUpScreen,
    addRelationshipScreen,
    contactsSingleScreen,
    personTypes,
    mongoCollections,
    changingMongoCollections,
    changingSQLiteCollections,
    userResidenceAddress,
    contactFollowUpStatuses,
    followUpStatuses,
    TextSwitchSelectorAgeOrDobValues,
    ageUnitOfMeasureDropDown,
    localTranslationTokens,
    sortOrderDropDownItems,
    sortCriteriaDropDownItems,
    eventSortCriteriaDropDownItems,
    userPermissions,
    helpSingleScreen,
    helpItemsSortCriteriaDropDownItems,
    caseFieldsForHardCodeCheck,
    manualSyncStages,
    dateRangeTypes,
    documentTypes,
    caseBlueprint,
    statusPendingWipe,
    rawSQLQueryString,
    rawSQLQueryWhereString,
    whocdCredentials,
    contactsOfContactsPersonal,
    addressFields,
    labResultsFilterScreenNoContactPermission,
    personFilterScreen
};

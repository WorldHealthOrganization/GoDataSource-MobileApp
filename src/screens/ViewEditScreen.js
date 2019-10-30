import React, {Component} from 'react';
import {View, Text} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import config from './../utils/config';
import {getContactById, getExposuresForContact} from './../actions/contacts';
import {getFollowUpsForContactId, getFollowUpById} from './../actions/followUps';
import {getRelationsForCase, getItemByIdRequest} from './../actions/cases';


class ViewEditScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            interactionsComplete: false,
            loading: true,

            routes: [],
            index: lodashGet(this.props, 'index', 0),
            editableElement: {},
            additionalElement: {},
            isEditMode: lodashGet(this.props, 'isEditMode', false),

            currentAnswers: {},
            previousAnswers: [],

            isDateTimePickerVisible: false,
        };
    }

    componentDidMount() {
        this.computeAdditionalDataMethod()
            .then((arrayOfData) => {
                this.computeDataFromArray(arrayOfData);
            })
    }

    render() {
        return (
            <View>
                <Text>Test</Text>
            </View>
        );
    }

    computeAdditionalDataMethod = () => {
        let arrayOfPromises = [];

        switch (this.props.elementType) {
            case 'followUp':
                arrayOfPromises.push(
                    getFollowUpById(
                        lodashGet(this.props, 'elementId', null),
                        lodashGet(this.props, 'outbreakId', null)
                    )
                );
                arrayOfPromises.push(
                    getContactById(
                        lodashGet(this.props, 'outbreakId', null),
                        lodashGet(this.props, 'additionalId', null)
                    )
                );
                break;
            case 'contact':
                arrayOfPromises.push(
                    getItemByIdRequest(
                        lodashGet(this.props, 'elementId', null)
                    )
                );
                arrayOfPromises.push(
                    getFollowUpsForContactId(
                        lodashGet(this.props, 'elementId', null),
                        lodashGet(this.props, 'outbreakId', null),
                        lodashGet(this.props, 'teams', null)
                    )
                );
                arrayOfPromises.push(
                    getExposuresForContact(
                        lodashGet(this.props, 'elementId', null),
                        lodashGet(this.props, 'outbreakId', null)
                    )
                );
                break;
            case 'case':
                arrayOfPromises.push(
                    getItemByIdRequest(
                        lodashGet(this.props, 'elementId', null)
                    )
                );
                arrayOfPromises.push(
                    getRelationsForCase(
                        lodashGet(this.props, 'elementId', null)
                    )
                );
                break;
            case 'event':
                arrayOfPromises.push(Promise.resolve());
                break;
            default:
                arrayOfPromises.push(Promise.resolve());
        }

        return Promise.all(arrayOfPromises);
    }

    computeDataFromArray = (arrayOfData) => {
        let editableElement = {};
        let additionalElement = {};
        switch (lodashGet(this.props, 'elementType', null)) {
                // arrayOfData = [followUpData, contactData]
            case 'followUp':
                editableElement = lodashGet(arrayOfData, '[0]', {});
                additionalElement = lodashGet(arrayOfData, '[1]', {});
                break;
                // arrayOfData = [contactData, followUpsData, exposureData]
            case 'contact':

                break;
                // arrayOfData = [caseData, contactsData]
            case 'case':

                break;
                // arrayOfData = []
            case 'event':
                break;
            default:
                break;
        }

        this.setState(prevState => ({
            editableElement: editableElement,
            additionalElement: additionalElement
        }), () => {
            console.log('EditableElement: ', this.state.editableElement, this.state.additionalElement);
        });
    }
}

ViewEditScreen.propTypes = {
    elementType: PropTypes.oneOf(['followUp', 'contact', 'case', 'event']).isRequired,
    elementId: PropTypes.string.isRequired,
    additionalId: checkAdditionalId,
    previousScreen: PropTypes.string.isRequired,
    refresh: PropTypes.func,
    isNew: PropTypes.bool
};

let checkAdditionalId = function (props, propName, componentName) {
    if (lodashGet(props, 'elementType', null) === 'followUp') {
        if (lodashGet(props, `[${propName}]`, null) === null) {
            return new Error(`No additional id sent to component: ${componentName}`);
        }
    }
};

ViewEditScreen.defaultProps = {
    refresh: () => {console.log('ViewEditScreen default onRefresh method')},
    isNew: false
};

function mapStateToProps(state) {
    return {
        user: lodashGet(state, 'user', {}),
        outbreakId: lodashGet(state, 'user.activeOutbreakId', null),
        screenSize: lodashGet(state, 'app.screenSize', config.designScreenSize),
        caseInvestigationTemplate: lodashGet(state, 'outbreak.caseInvestigationTemplate', null),
        contactFollowUpTemplate: lodashGet(state, 'outbreak.contactFollowUpTemplate', null),
        translation: lodashGet(state, 'app.translation', null),
        teams: lodashGet(state, 'teams', null)
    };
}

export default connect(mapStateToProps)(ViewEditScreen);

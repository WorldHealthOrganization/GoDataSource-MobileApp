import React, {Component} from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import ViewEditScreen from './ViewEditScreen';
import config from '../../utils/config';
import {getContactById, getExposuresForContact} from '../../actions/contacts';
import {getFollowUpsForContactId, getFollowUpById} from '../../actions/followUps';
import {getRelationsForCase, getItemByIdRequest} from '../../actions/cases';

export function enhanceTabsWithDataHandling() {
    return function withEditHandling(WrappedComponent) {
        class ViewEditScreenContainer extends Component {

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
                    <WrappedComponent
                        elementType={this.props.elementType}
                        element={this.state.editableElement}
                        additionalData={this.state.additionalElement}
                        {...this.props}
                    />
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
            };

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

        ViewEditScreenContainer.propTypes = {
            elementType: PropTypes.oneOf(['followUp', 'contact', 'case', 'event']).isRequired,
            elementId: PropTypes.string.isRequired,
            additionalId: function (props, propName, componentName) {
                if (lodashGet(props, 'elementType', null) === 'followUp') {
                    if (lodashGet(props, `[${propName}]`, null) === null) {
                        return new Error(`No additional id sent to component: ${componentName}`);
                    }
                }
            },
            previousScreen: PropTypes.string.isRequired,
            refresh: PropTypes.func,
            isNew: PropTypes.bool
        };

        ViewEditScreenContainer.defaultProps = {
            refresh: () => {console.log('ViewEditScreen default onRefresh method')},
            isNew: false
        };

        return ViewEditScreenContainer;
    }
}
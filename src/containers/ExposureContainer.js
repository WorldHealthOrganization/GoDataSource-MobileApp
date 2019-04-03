/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import { View, Text, StyleSheet, InteractionManager, Alert, findNodeHandle, ScrollView, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {LoaderScreen} from 'react-native-ui-lib';
import {calculateDimension, getTranslation, extractIdFromPouchId} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Button from './../components/Button';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CardComponent from './../components/CardComponent';
import translations from './../utils/translations'
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';

class ExposureContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false
        };
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({
                interactionComplete: true
            })
        })
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <KeyboardAwareScrollView
                style={style.containerScrollView}
                contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                keyboardShouldPersistTaps={'always'}
                extraHeight={20 + 81 + 70}
                innerRef={ref => {
                    this.scrollExposure = ref
                }}
            >
                <View style={style.container}>
                    {
                        this.props.fromExposureScreen === true ? (
                            this.renderItemCardComponent(config.addExposureScreen)
                        ) : (
                            this.handleRenderItem(null, 0)
                        )
                    }
                </View>
            </KeyboardAwareScrollView>
        );
    }

    handleOnFocus = (event) => {
        this.scrollToInput(findNodeHandle(event.target))
    };

    handleOnBlur = (event) =>{
        this.scrollExposure.props.scrollToPosition(0, 0)
        this.scrollToInput(findNodeHandle(event.target))
    }

    scrollToInput (reactNode) {
        this.scrollExposure.props.scrollToFocusedInput(reactNode)

    };

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        let fields = config.contactsSingleScreen.relationship.fields.map((field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode !== undefined && this.props.isEditMode !== null ? this.props.isEditMode : true})
        });
        return this.renderItemCardComponent(fields, index)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView elevation={3} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4,
                minHeight: calculateDimension(72, true, this.props.screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
                    {
                        fields && fields.map((item, index) => {
                            return this.handleRenderItemCardComponent(item, index, cardIndex);
                        })
                    }
                </ScrollView>
            </ElevatedView>
        );
    };

    handleRenderItemCardComponent = (item, index, cardIndex) => {
        return (
            <View style={[style.subcontainerCardComponent, {flex: 1}]} key={index}>
                {
                    this.handleRenderItemByType(item, cardIndex)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, cardIndex) => {
        let addContactFromCasesScreen = false;
        let value = '';
     
        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForExposure(item);
        }

        if (item.type === 'DropdownInput' && item.id === 'clusterId' && this.props.exposure.clusterId) {
            let myCluster = this.props.clusters.filter((e) => {
                return extractIdFromPouchId(e._id, 'cluster') === this.props.exposure.clusterId
            })
            value = myCluster[0].name
        } else {
            value = this.computeExposureValue(item);
        }

        if (this.props.addContactFromCasesScreen && this.props.addContactFromCasesScreen !== undefined && item.id === 'exposure') {
            addContactFromCasesScreen = true
        }

        if (item.type === 'DatePicker' && value === '') {
            value = null
        }
        let isEditModeForDropDownInput = addContactFromCasesScreen ? false : true

        let dateValidation = this.setDateValidations(item);
        minimumDate = dateValidation.minimumDate;
        maximumDate = dateValidation.maximumDate;

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode !== undefined && this.props.isEditMode !== null ? this.props.isEditMode : true}
                exposure={this.props.exposure}
                isEditModeForDropDownInput={isEditModeForDropDownInput}
                value={value}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                index={cardIndex}
                
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeDate={this.props.onChangeDate}
                onChangeText={this.props.onChangeText}
                onChangeSwitch={this.props.onChangeSwitch}
                onFocus={this.handleOnFocus}
                onBlur={this.handleOnBlur}
            />
        )
    };

    computeExposureValue = (item) => {
        let value = '';

        value = this.props.exposure[item.id];
        if (item.id === 'exposure') {
            if (this.props.exposure.persons && Array.isArray(this.props.exposure.persons) && this.props.exposure.persons.length > 0) {
                let persons = this.props.exposure.persons.filter((e) => {return e.type !== (this.props.type === 'Contact' ? config.personTypes.contacts : config.personTypes.contacts)});
                value = this.extractNameForExposure(persons[0]);
            }
        }
        return getTranslation(value, this.props.translation);
    };

    setDateValidations = (item) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.id === 'contactDate') {
                maximumDate = new Date()
            }
        }
        
        let dateValidation = {minimumDate, maximumDate}
        return dateValidation
    };

    computeDataForExposure = (item) => {
        let data = [];
        if (item.categoryId) {
            data = this.props.referenceData.filter((e) => {return e.active === true && e.categoryId === item.categoryId})
                                        .sort((a,b) => { return a.order - b.order; })
                                        .map((e) => {return {value: getTranslation(e.value, this.props.translation), id: extractIdFromPouchId(e._id, 'referenceData')}});
        } else {
            if (item.id === 'exposure') {
                if (this.props.type !== 'Contact') {
                    data = this.props.contacts.map((e) => {return {value: ((e.firstName ? e.firstName + ' ' : '') + (e.lastName ? e.lastName : '')), id: extractIdFromPouchId(e._id, 'person'), type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CONTACT'}});
                }
                if (this.props.cases && this.props.cases.length > 0){
                    data = this.props.cases.map((e) => {return {value: ((e.firstName ? e.firstName + ' ' : '') + (e.lastName ? e.lastName : '')), id: extractIdFromPouchId(e._id, 'person'), type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_CASE'}});
                }
                data = data.concat(this.props.events.map((e) => {return {value: e.name, id: extractIdFromPouchId(e._id, 'person'), type: 'LNG_REFERENCE_DATA_CATEGORY_PERSON_TYPE_EVENT'}}));
            } else {
                if (item.id === 'clusterId') {
                    data = this.props.clusters.map((e) => {
                        return {value: e.name, id: extractIdFromPouchId(e._id, 'cluster')}
                    })
                }
            }
        }
        return data;
    };

    extractNameForExposure = (person) => {
        switch (person.type) {
            case config.personTypes.cases:
                return (this.props.cases && Array.isArray(this.props.cases) && this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName ? (this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName + ' ') : '') +
                    (this.props.cases && Array.isArray(this.props.cases) && this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName ? (this.props.cases[this.props.cases.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName) : '');
            case config.personTypes.events:
                return (this.props.events && Array.isArray(this.props.events) && this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.events[this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].name ? (this.props.events[this.props.events.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].name) : '');
            case config.personTypes.contacts:
                return (this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName ? (this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].firstName + ' ') : '') +
                    (this.props.contacts && Array.isArray(this.props.contacts) && this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id) > -1 && this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName ? (this.props.contacts[this.props.contacts.map((e) => {return extractIdFromPouchId(e._id, 'person'); }).indexOf(person.id)].lastName) : '');
            default:
                return ''
        }
    };
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerCardComponent: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    subcontainerCardComponent: {
        alignItems: 'center',
        flex: 1
    },
    viewContainer: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        alignItems: 'center',
    },
    cardStyle: {
        marginVertical: 4,
        flex: 1
    },
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
    container: {
        flex: 1,
        marginBottom: 30
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        cases: state.cases,
        translation: state.app.translation,
        referenceData: state.referenceData,
        locations: state.locations,
        events: state.events,
        clusters: state.clusters,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ExposureContainer);

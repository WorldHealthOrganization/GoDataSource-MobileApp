/**
 * Created by florinpopa on 21/08/2018.
 */
/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Animated, FlatList, InteractionManager, ScrollView, StyleSheet, Text, View} from 'react-native';
import {calculateDimension, computeFullName, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import styles from './../styles';
import ElevatedView from 'react-native-elevated-view';
import {LoaderScreen} from 'react-native-ui-lib';
import GeneralListItem from '../components/GeneralListItem';
import Ripple from 'react-native-material-ripple';
import moment from 'moment/min/moment.min';
import translations from './../utils/translations';
import ExposureContainer from '../containers/ExposureContainer';
import get from 'lodash/get';
import TopContainerButtons from "./../components/TopContainerButtons";
import PermissionComponent from './../components/PermissionComponent';
import constants, {PERMISSIONS_CONTACT_OF_CONTACT} from './../utils/constants';
import config from './../utils/config';
import {
    PERMISSION_CREATE_CONTACT,
    PERMISSION_CREATE_CONTACT_OF_CONTACT,
    PERMISSION_EDIT_CONTACT, PERMISSION_EDIT_CONTACT_OF_CONTACT
} from "../utils/constants";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class ContactsSingleExposures extends Component {

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
            });
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.routeKey === 'exposures') {
            return true;
        }
        return false;
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log("### contact data: ", this.props.contact);
        if(!this.state.interactionComplete) {
            return (
                <LoaderScreen overlay={true} backgroundColor={'white'}/>
            )
        }

        let permissionsList = [];
        if (this.props.isNew) {
            permissionsList = this.props.type === translations.personTypes.contactsOfContacts ? PERMISSION_CREATE_CONTACT_OF_CONTACT : PERMISSION_CREATE_CONTACT;
        } else {
            permissionsList = this.props.type === translations.personTypes.contactsOfContacts ? PERMISSION_EDIT_CONTACT_OF_CONTACT : PERMISSION_EDIT_CONTACT;
        }

        return (
            <ElevatedView elevation={3} style={[style.container]}>
                <View style = {{alignItems: 'center'}}>

                    <PermissionComponent
                        render={() => (
                            <TopContainerButtons
                                isNew={this.props.isNew}
                                isEditMode={this.props.isEditMode}
                                index={this.props.activeIndex}
                                numberOfTabs={this.props.numberOfTabs}
                                onPressEdit={this.props.onPressEdit}
                                onPressSaveEdit={this.props.onPressSaveEdit}
                                onPressCancelEdit={this.props.onPressCancelEdit}
                                onPressNextButton={this.props.onPressNextButton}
                                onPressPreviousButton={this.handleBackButton}
                            />
                        )}
                        permissionsList={permissionsList}
                    />

                </View>
                {
                    !this.props.isNew ? (
                        <PermissionComponent
                            render={() => (
                                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                                    <AnimatedFlatList
                                        data={get(this.props, 'contact.relationships', [])}
                                        renderItem={this.renderRelationship}
                                        keyExtractor={this.keyExtractor}
                                        ItemSeparatorComponent={this.renderSeparatorComponent}
                                        ListEmptyComponent={this.listEmptyComponent}
                                        style={[style.listViewStyle]}
                                        componentContainerStyle={style.componentContainerStyle}
                                    />
                                    <View style={{height: 30}}/>
                                </ScrollView>
                            )}
                            permissionsList={[
                                constants.PERMISSIONS_RELATIONSHIP.relationshipAll,
                                constants.PERMISSIONS_RELATIONSHIP.relationshipView,
                                constants.PERMISSIONS_RELATIONSHIP.relationshipList,
                                constants.PERMISSIONS_CONTACT.contactListRelationshipExposures,
                                constants.PERMISSIONS_CONTACT.contactListRelationshipContacts
                            ]}
                        />
                    ) : (
                        <ExposureContainer
                            exposure={this.props.contact.relationships[0]}
                            addContactFromCasesScreen={this.props.addContactFromCasesScreen}
                            fromExposureScreen={false}
                            isEditMode={this.props.isEditMode}
                            contact={this.props.contact}
                            onChangeDropDown={this.props.onChangeDropDown}
                            onChangeDate={this.props.onChangeDate}
                            onChangeText={this.props.onChangeText}
                            onChangeSwitch={this.props.onChangeSwitch}
                            selectedExposure={this.props.selectedExposure}
                        />
                    )
                }
            </ElevatedView>
            
        );
    }

    // Please write here all the methods that are not react native lifecycle methods

    keyExtractor = (item, index) => {
        return item.id;
    };

    handleBackButton = () => {
        this.props.onPressPreviousButton()
    };

    renderRelationship = (relation) => {

        let {title, primaryText, secondaryText} = this.getCaseName(relation);
        let textsArray = []
        if (this.props.isEditMode === true){
            textsArray = [
                getTranslation(translations.generalButtons.editButtonLabel, this.props.translation)
                // getTranslation(translations.generalButtons.deleteButtonLabel, this.props.translation)
            ]
        }
        return (
            <GeneralListItem
                title={title}
                primaryText={primaryText}
                secondaryText={secondaryText}
                hasActionsBar={true}
                textsArray={textsArray}
                textsStyleArray={[
                    {
                        marginLeft: calculateDimension(14, false, this.props.screenSize),
                        color: styles.buttonGreen,
                        fontFamily: 'Roboto-Medium',
                        fontSize: 12
                    }
                ]}
                onPressArray={[
                    () => {this.props.onPressEditExposure(relation.item, relation.index)}
                    // () => {this.props.onPressDeleteExposure(relation.item, relation.index)}
                    ]}
                arrayPermissions={[
                    [
                        constants.PERMISSIONS_RELATIONSHIP.relationshipAll,
                        constants.PERMISSIONS_RELATIONSHIP.relationshipModify
                    ]
                ]}
                containerStyle={{flex: 1, height: '100%', marginHorizontal: calculateDimension(16, false, this.props.screenSize)}}
                translation={this.props.translation}
            />
        )
    };

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    listEmptyComponent = () => {
        return (
            <View style={{alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize), marginVertical: 20}}>
            {
                this.props.isEditMode !== null && this.props.isEditMode !== undefined && this.props.isEditMode === true ? (
                    <Ripple
                        style={{
                            height: 25,
                            justifyContent: 'center'
                        }}
                        onPress={this.onPressAddExposure}
                    >
                        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>
                            {getTranslation(translations.contactSingleScreen.exposureText, this.props.translation)}
                        </Text>
                    </Ripple>
                ) : null
            }
            </View>
        )
    };

    getCaseName = (relation) => {
        if (relation && relation.item) {
            relation = relation.item;
        }

        let relationshipData = get(relation, 'relationshipData');
        let caseData = get(relation, 'caseData');

        return {title: computeFullName(caseData), primaryText: moment.utc(relationshipData.contactDate).format("YYYY-MM-DD").toString(), secondaryText: getTranslation(relationshipData.certaintyLevelId, this.props.translation)};
    };

    onPressAddExposure = () => {
        this.props.navigator.showModal({
            screen: "ExposureScreen",
            animated: true,
            passProps: {
                contact: null,
                type: 'Contact',
                saveExposure: this.props.saveExposure,
            }
        })
    };
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        borderRadius: 2
    },
    containerContent: {
        flex: 1,
        backgroundColor: 'rgba(217, 217, 217, 0.5)'
    },
    separatorComponentStyle: {
        height: 8
    },
    listViewStyle: {
        flex: 1,
        paddingTop: 10
    }
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config),
        translation: get(state, 'app.translation', []),
        role: get(state, 'role', [])
    };
}

export default connect(mapStateToProps)(ContactsSingleExposures);

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
import {calculateDimension, computeFullName, createStackFromComponent, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import ElevatedView from 'react-native-elevated-view';
import {LoaderScreen} from 'react-native-ui-lib';
import GeneralListItem from '../components/GeneralListItem';
import moment from 'moment-timezone';
import translations from './../utils/translations';
import RelationshipContainer from '../containers/RelationshipContainer';
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
import {Navigation} from "react-native-navigation";
import Button from './../components/Button';
import styles from './../styles';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class ContactsSingleRelationship extends Component {

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
        if (nextProps.routeKey === 'exposures' || nextProps.routeKey === 'contacts') {
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
                <LoaderScreen
                    overlay={true}
                    loaderColor={styles.primaryColor}
                    backgroundColor={'rgba(255, 255, 255, 0.8)'} />
            )
        }

        let permissionsList = [];
        if (this.props.isNew) {
            permissionsList = this.props.type === translations.personTypes.contactsOfContacts ? PERMISSION_CREATE_CONTACT_OF_CONTACT : PERMISSION_CREATE_CONTACT;
        } else {
            permissionsList = this.props.type === translations.personTypes.contactsOfContacts ? PERMISSION_EDIT_CONTACT_OF_CONTACT : PERMISSION_EDIT_CONTACT;
        }

        return (
            <ElevatedView elevation={5} style={[style.container]}>
                <View style={{alignItems: 'center'}}>

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
                                    {
                                        this.listEmptyComponent()
                                    }
                                    <AnimatedFlatList
                                        data={this.props.relationshipType === constants.RELATIONSHIP_TYPE.contact ?
                                            get(this.props.contact, 'relationships.contactRelations', [])
                                            :
                                            get(this.props.contact, 'relationships.exposureRelations', [])
                                        }
                                        renderItem={this.renderRelationship}
                                        keyExtractor={this.keyExtractor}
                                        ItemSeparatorComponent={this.renderSeparatorComponent}
                                        // ListEmptyComponent={this.listEmptyComponent}
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
                        <RelationshipContainer
                            person={this.props.contact}
                            preparedFields={this.props.preparedFields}
                            exposure={this.props.contact.relationships[0]}
                            addContactFromCasesScreen={this.props.addContactFromCasesScreen}
                            fromRelationshipScreen={false}
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
        return item.id || index;
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
                textsStyleArray={style.editButtonStyle}
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
            <View style={{alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize)}}>
            {
                this.props.isEditMode !== null && this.props.isEditMode !== undefined && this.props.isEditMode === true ? (
                    <Button
                        title={this.props.relationshipType === constants.RELATIONSHIP_TYPE.exposure ? getTranslation(translations.contactSingleScreen.exposureText, this.props.translation) : getTranslation(translations.casesScreen.addContactButtonLabel)}
                        onPress={this.onPressAddExposure}
                        color={styles.backgroundColor}
                        titleColor={styles.textColor}
                        height={calculateDimension(35, true, this.props.screenSize)}
                        width={'100%'}
                        style={{marginVertical: calculateDimension(8, true, this.props.screenSize)}}
                    />
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

        return {title: computeFullName(caseData), primaryText: moment.tz(relationshipData.contactDate, this.props.timezone).format("YYYY-MM-DD").toString(), secondaryText: getTranslation(relationshipData.certaintyLevelId, this.props.translation)};
    };

    onPressAddExposure = () => {
        Navigation.showModal(createStackFromComponent({
            name: "RelationshipScreen",
            passProps: {
                contact: this.props.contact,
                type: this.props.type === translations.personTypes.contactsOfContacts ? 'ContactOfContact' : 'Contact',
                saveExposure: this.props.saveExposure,
                refreshRelations: this.props.refreshRelations,
                relationshipType: this.props.relationshipType
            }
        }))
    };
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        backgroundColor: styles.screenBackgroundColor,
        borderRadius: 4,
        flex: 1
    },
    containerContent: {
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    separatorComponentStyle: {
        height: 8
    },
    listViewStyle: {
        flex: 1,
        paddingTop: 8
    },
    editButtonStyle: {
        backgroundColor: styles.primaryColorRgb,
        borderRadius: 4,
        color: styles.primaryColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 26,
        textAlign: 'center',
        width: '100%'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config),
        translation: get(state, 'app.translation', []),
        role: get(state, 'role', []),
        timezone: get(state, 'app.timezone', null)
    };
}

export default connect(mapStateToProps)(ContactsSingleRelationship);

/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Animated, FlatList, InteractionManager, ScrollView, StyleSheet, Text, View} from 'react-native';
import {calculateDimension, computeFullName, createStackFromComponent, getTranslation} from './../utils/functions';
import {connect} from "react-redux";
import styles from './../styles';
import ElevatedView from 'react-native-elevated-view';
import {LoaderScreen} from 'react-native-ui-lib';
import GeneralListItem from '../components/GeneralListItem';
import Button from './../components/Button';
import moment from 'moment/min/moment.min';
import translations from './../utils/translations';
import config from './../utils/config';
import get from 'lodash/get';
import TopContainerButtons from "../components/TopContainerButtons";
import PermissionComponent from './../components/PermissionComponent';
import constants from "./../utils/constants";
import {Navigation} from "react-native-navigation";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class CaseSingleRelationshipContainer extends Component {

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
        if(!this.state.interactionComplete) {
            return (
                <LoaderScreen overlay={true} backgroundColor={'white'}/>
            )
        }

        return (
            <ElevatedView elevation={5} style={[style.container]}>
                <PermissionComponent
                    render={() => (
                        <TopContainerButtons
                            isNew={this.props.isNew}
                            isEditMode={this.props.isEditMode}
                            index={this.props.index}
                            numberOfTabs={this.props.numberOfTabs}
                            onPressEdit={this.props.onPressEdit}
                            onPressSaveEdit={this.props.onPressSaveEdit}
                            onPressCancelEdit={this.props.onPressCancelEdit}
                            onPressNextButton={this.handleNextButton}
                            onPressPreviousButton={this.handleBackButton}
                        />
                    )}
                    permissionsList={[
                        constants.PERMISSIONS_CASE.caseAll,
                        constants.PERMISSIONS_CASE.caseCreate,
                        constants.PERMISSIONS_CASE.caseModify
                    ]}
                />
                <PermissionComponent
                    render={() => (
                        <ScrollView >
                            {
                                this.listEmptyComponent()
                            }
                            <AnimatedFlatList
                                data={get(this.props, 'relations', [])}
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
                        constants.PERMISSIONS_CASE.caseListRelationshipExposures,
                        constants.PERMISSIONS_CASE.caseListRelationshipContacts
                    ]}
                />
            </ElevatedView>

        );
    }

    // Please write here all the methods that are not react native lifecycle methods

    keyExtractor = (item, index) => {
        return item.id;
    };

    handleBackButton = () => {
        this.props.handleMoveToPrevieousScreenButton()
    };

    renderRelationship = (relation) => {

        let {title, primaryText, secondaryText} = this.getContactName(relation);
        let textsArray = [];
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
                        color: styles.primaryButton,
                        fontFamily: 'Roboto-Medium',
                        fontSize: 12
                    }
                ]}
                onPressArray={[
                    () => {this.props.onPressEditExposure(relation.item, relation.index)}
                    // () => {this.props.onPressDeleteExposure(relation.item, relation.index)}
                ]}
                arrayPermissions={[
                    [constants.PERMISSIONS_RELATIONSHIP.relationshipAll, constants.PERMISSIONS_RELATIONSHIP.relationshipModify]
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
                            width={calculateDimension(175, false, this.props.screenSize)}
                            style={{marginVertical: calculateDimension(8, true, this.props.screenSize)}}
                        />
                    ) : null
                }
            </View>
        )
    };

    getContactName = (relation) => {
        if (relation && relation.item) {
            relation = relation.item;
        }
        let relationshipData = get(relation, 'relationshipData');
        let caseData = get(relation, 'contactData');

        return {title: computeFullName(caseData), primaryText: moment.utc(relationshipData.contactDate).format("YYYY-MM-DD").toString(), secondaryText: getTranslation(relationshipData.certaintyLevelId, this.props.translation)};
    };

    onPressAddExposure = () => {
        Navigation.showModal(createStackFromComponent({
            name: "RelationshipScreen",
            passProps: {
                case: this.props.case,
                type: 'Case',
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
        // flex: 1,
        backgroundColor: styles.disabledColor
    },
    separatorComponentStyle: {
        height: 8
    },
    listViewStyle: {
        // flex: 1,
        paddingTop: 8
    }
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', []),
        role: get(state, 'role', [])
    };
}

export default connect(mapStateToProps)(CaseSingleRelationshipContainer);

/**
 * Created by florinpopa on 21/08/2018.
 */
/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {Animated, StyleSheet, InteractionManager, ScrollView, View, Text} from 'react-native';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import Button from './../components/Button';
import {extractIdFromPouchId, getTranslation} from './../utils/functions';
import {bindActionCreators} from "redux";
import styles from './../styles';
import ElevatedView from 'react-native-elevated-view';
import {LoaderScreen} from 'react-native-ui-lib';
import AnimatedListView from './../components/AnimatedListView';
import GeneralListItem from '../components/GeneralListItem';
import Ripple from 'react-native-material-ripple';
import moment from 'moment';
import translations from './../utils/translations'
import ExposureContainer from '../containers/ExposureContainer';

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);

class ContactsSingleExposures extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false
        };
    }

    // Please add here the react lifecycle methods that you need
    // shouldComponentUpdate(nextProps, nextState) {
    //     // console.log("NextPropsIndex ContactsSingleExposures: ", nextProps.activeIndex, this.props.activeIndex);
    //     return nextProps.activeIndex === 2;
    // }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({
                interactionComplete: true
            });
        });
    }

    clampedScroll= Animated.diffClamp(
        Animated.add(
            scrollAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolateLeft: 'clamp',
            }),
            offsetAnim,
        ),
        0,
        30,
    );

    handleScroll = Animated.event(
        [{nativeEvent: {contentOffset: {y: scrollAnim}}}],
        {useNativeDriver: true}
    );

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

        const navbarTranslate = this.clampedScroll.interpolate({
            inputRange: [0, 30],
            outputRange: [0, -30],
            extrapolate: 'clamp',
        });
        const navbarOpacity = this.clampedScroll.interpolate({
            inputRange: [0, 30],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <ElevatedView elevation={3} style={[style.container]}>
                <View style = {{alignItems: 'center'}}>
                    <View style={{flexDirection: 'row'}}>
                        <Button
                            title={getTranslation(translations.generalButtons.backButtonLabel, this.props.translation)}
                            onPress={this.handleBackButton}
                            color={styles.buttonGreen}
                            titleColor={'white'}
                            height={calculateDimension(25, true, this.props.screenSize)}
                            width={calculateDimension(130, false, this.props.screenSize)}
                            style={{
                                marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                        }}/>
                        {
                            this.props.isEditMode === true ? (
                                <Button
                                    title={getTranslation(translations.generalButtons.saveButtonLabel, this.props.translation)}
                                    onPress={this.props.handleOnPressSave}
                                    color={styles.buttonGreen}
                                    titleColor={'white'}
                                    height={calculateDimension(25, true, this.props.screenSize)}
                                    width={calculateDimension(130, false, this.props.screenSize)}
                                    style={{
                                        marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                                        marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                                }}/> 
                            ) : null
                        }
                    </View>
                </View>
                {
                    !this.props.isNew ? (
                        <ScrollView contentContainerStyle={{flexGrow: 1}}>
                            <AnimatedListView
                                data={this.props.contact && this.props.contact.relationships && Array.isArray(this.props.contact.relationships) ? this.props.contact.relationships : []}
                                renderItem={this.renderRelationship}
                                keyExtractor={this.keyExtractor}
                                ItemSeparatorComponent={this.renderSeparatorComponent}
                                ListEmptyComponent={this.listEmptyComponent}
                                style={[style.listViewStyle]}
                                componentContainerStyle={style.componentContainerStyle}
                                onScroll={this.handleScroll}
                            />
                            <View style={{height: 30}}/>
                        </ScrollView>
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
        this.props.handleMoveToPrevieousScreenButton()
    };

    renderRelationship = (relation) => {

        let {title, primaryText, secondaryText} = this.getCaseName(relation);
        let textsArray = []
        if (this.props.isEditMode === true){
            textsArray = [getTranslation(translations.generalButtons.editButtonLabel, this.props.translation), getTranslation(translations.generalButtons.deleteButtonLabel, this.props.translation)]
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
                    },
                    {
                        marginRight: calculateDimension(14, false, this.props.screenSize),
                        color: styles.missedRedColor,
                        fontFamily: 'Roboto-Medium',
                        fontSize: 12
                    }
                ]}
                onPressArray={[() => {this.props.onPressEditExposure(relation.item, relation.index)}, () => {this.props.onPressDeleteExposure(relation.item, relation.index)}]}
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

        let person = relation && relation.persons && relation.persons.filter((e) => {return e.id !== extractIdFromPouchId(this.props.contact._id, 'person')})[0];

        let caseName = '';

        if (person.type === config.personTypes.cases ) {
            if (this.props.cases) {
                let aux = this.props.cases.filter((e) => {return extractIdFromPouchId(e._id, 'person')  === person.id})[0];
                caseName = (aux && aux.firstName ? (aux.firstName + ' ') : '') + (aux && aux.lastName ? aux.lastName : '');
            }
        } else {
            let aux = this.props.events.filter((e) => {return extractIdFromPouchId(e._id, 'person') === person.id})[0];
            caseName = aux && aux.name ? aux.name : '';
        }

        return {title: caseName, primaryText: moment(relation.contactDate).format("YYYY-MM-DD").toString(), secondaryText: getTranslation(relation.certaintyLevelId, this.props.translation)};
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
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        cases: state.cases,
        events: state.events,
        translation: state.app.translation,
        role: state.role
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ContactsSingleExposures);

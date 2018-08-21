/**
 * Created by florinpopa on 18/07/2018.
 */
import React, {Component} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Button} from 'react-native-material-ui';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import CalendarPicker from './../components/CalendarPicker';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import ButtonWithIcons from './../components/ButtonWithIcons';
import FollowUpListItem from './../components/FollowUpListItem';
import SearchFilterView from './../components/SearchFilterView';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import AnimatedListView from './../components/AnimatedListView';
import {LoaderScreen, Colors} from 'react-native-ui-lib';

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);


class ContactsScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            contacts: [],
            filter: {
                date: new Date()
            }
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // Please add here the react lifecycle methods that you need


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
            <View style={style.container}>
                <NavBarCustom
                    title="Contacts"
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                >
                    {/*<CalendarPicker*/}
                        {/*width={calculateDimension(124, false, this.props.screenSize)}*/}
                        {/*height={calculateDimension(25, true, this.props.screenSize)}*/}
                        {/*value={this.state.filter.date || new Date()}*/}
                    {/*/>*/}
                    {/*<ButtonWithIcons*/}
                        {/*label="Altceva"*/}
                        {/*width={calculateDimension(124, false, this.props.screenSize)}*/}
                        {/*height={calculateDimension(25, true, this.props.screenSize)}*/}
                        {/*firstIcon="visibility"*/}
                        {/*secondIcon="arrow-drop-down"*/}
                        {/*isFirstIconPureMaterial={true}*/}
                        {/*isSecondIconPureMaterial={true}*/}
                    {/*/>*/}
                    {/*<Button raised text="" onPress={() => console.log("Empty button")} icon="add"*/}
                            {/*style={{*/}
                                {/*container: {width: calculateDimension(33, true, this.props.screenSize),height: calculateDimension(25, true, this.props.screenSize), margin: 0, padding: 0},*/}
                                {/*text: {width: 0, margin: 0, padding: 0, height: 0},*/}
                                {/*icon: {margin: 0, padding: 0, alignSelf: 'center'}*/}
                            {/*}}/>*/}
                </NavBarCustom>
                <View style={style.containerContent}>
                    <AnimatedListView
                        stickyHeaderIndices={[0]}
                        data={this.props.contacts || []}
                        renderItem={this.renderContact}
                        keyExtractor={this.keyExtractor}
                        ListHeaderComponent={
                            <SearchFilterView
                                style={{
                                    transform: [{
                                        translateY: navbarTranslate
                                    }],
                                    opacity: navbarOpacity
                                }}
                                value={this.state.filter.searchText}
                                onPress={this.handlePressFilter}
                                onChangeText={this.handleOnChangeText}
                                onSubmitEditing={this.handleOnSubmitEditing}
                                filterText={this.state.filterFromFilterScreen && this.state.filterFromFilterScreen.where && this.state.filterFromFilterScreen.where.and && Array.isArray(this.state.filterFromFilterScreen.where.and) ? ("Filter (" + this.state.filterFromFilterScreen.where.and.length + ')') : 'Filter'}
                            />}
                        ItemSeparatorComponent={this.renderSeparatorComponent}
                        // ListEmptyComponent={this.listEmptyComponent}
                        style={[style.listViewStyle]}
                        componentContainerStyle={style.componentContainerStyle}
                        onScroll={this.handleScroll}
                        // refreshing={this.state.refreshing}
                        // onRefresh={this.handleOnRefresh}
                    />
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    keyExtractor = (item, index) => item.id;

    renderContact = (item) => {
        // console.log("### item: ", item);
        return (
            <FollowUpListItem
                item={item.item}
                isContact={true}
                firstActionText={'ADD FOLLOW-UP'}
                secondActionText={"EDIT"}
                onPressFollowUp={this.handlePressFollowUp}
                onPressMissing={this.handleOnPressMissing}
                onPressExposure={this.handleOnPressExposure}
            />
        )
    };

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    handlePressFollowUp = (item, contact) => {
        console.log("### handlePressFollowUp: ", item, contact);
        this.props.navigator.push({
            screen: 'FollowUpsSingleScreen',
            animated: true,
            animationType: 'fade',
            passProps: {
                item: {
                    date: new Date(),
                    outbreakId: this.props.user.activeOutbreakId,
                    lostToFollowUp: false
                },
                contact: contact || item,
                filter: this.state.filter,
                isNew: true
            }
        })
    };

    handleOnPressMissing = (followUp, contact) => {
        followUp.lostToFollowUp = true;
        followUp.performed = true;
        // console.log("### ceva: ", followUp, contact);
        this.props.updateFollowUpAndContact(this.props.user.activeOutbreakId, contact.id, followUp.id, followUp, contact, this.props.user.token);
    };

    handleOnPressExposure = (followUp, contact) => {
        this.props.navigator.showModal({
            screen: "ExposureScreen",
            animated: true,
            passProps: {
                contact: contact,
                type: 'Contact'
            }
        })
    };

    handlePressNavbarButton = () => {
        this.props.navigator.toggleDrawer({
            side: 'left',
            animated: true,
            to: 'open'
        })
    };

    onNavigatorEvent = (event) => {
        if (event.type === 'DeepLink') {
            console.log("###");
            if (event.link.includes('Navigate')) {
                let linkComponents = event.link.split('/');
                console.log("### linkComponents: ", linkComponents);
                if (linkComponents.length > 0) {
                    let screenToSwitchTo = null;
                    switch(linkComponents[1]) {
                        case '0':
                            screenToSwitchTo = 'FollowUpsScreen';
                            break;
                        case '1':
                            screenToSwitchTo = "ContactsScreen";
                            break;
                        case '2':
                            screenToSwitchTo = "CasesScreen";
                            break;
                        default:
                            screenToSwitchTo = "FollowUpsScreen";
                            break;
                    }
                    console.log("Screen index: ", screenToSwitchTo);
                    this.props.navigator.resetTo({
                        screen: screenToSwitchTo,
                        animated: true
                    })
                }
            }
        }
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    containerContent: {
        flex: 1,
        backgroundColor: 'rgba(217, 217, 217, 0.5)'
    },
    separatorComponentStyle: {
        height: 8
    },
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        errors: state.errors
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(ContactsScreen);
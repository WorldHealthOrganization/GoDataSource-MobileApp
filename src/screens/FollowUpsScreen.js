/**
 * Created by florinpopa on 04/07/2018.
 */
/**
 * Created by florinpopa on 14/06/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Animated} from 'react-native';
import {Button} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import styles from './../styles';
import NavBarCustom from './../components/NavBarCustom';
import CalendarPicker from './../components/CalendarPicker';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import ButtonWithIcons from './../components/ButtonWithIcons';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SearchFilterView from './../components/SearchFilterView';
import FollowUpListItem from './../components/FollowUpListItem';
import MissedFollowUpListItem from './../components/MissedFollowUpListItem';
import ElevatedView from 'react-native-elevated-view';
import {Dropdown} from 'react-native-material-dropdown';
import AnimatedListView from './../components/AnimatedListView';
import ValuePicker from './../components/ValuePicker';
import {getFollowUpsForOutbreakId} from './../actions/followUps';

const scrollAnim = new Animated.Value(0);
const offsetAnim = new Animated.Value(0);

class FollowUpsScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            filter: null
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.renderFollowUp = this.renderFollowUp.bind(this);
        this.keyExtractor = this.keyExtractor.bind(this);
        this.renderSeparatorComponent = this.renderSeparatorComponent.bind(this);
        this.calculateTopForDropdown = this.calculateTopForDropdown.bind(this);
        this.listEmptyComponent = this.listEmptyComponent.bind(this);
        this.onSelectValue = this.onSelectValue.bind(this);
        this.handleDayPress = this.handleDayPress.bind(this);
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
                <NavBarCustom title="Follow-ups" navigator={this.props.navigator} >
                    <CalendarPicker
                        width={calculateDimension(124, false, this.props.screenSize)}
                        height={calculateDimension(25, true, this.props.screenSize)}
                        onDayPress={this.handleDayPress}
                    />
                    <ValuePicker
                        top={this.calculateTopForDropdown()}
                        onSelectValue={this.onSelectValue}
                    />
                    <Button raised text="" onPress={() => console.log("Empty button")} icon="add"
                            style={{
                                container: {width: calculateDimension(33, true, this.props.screenSize),height: calculateDimension(25, true, this.props.screenSize), margin: 0, padding: 0},
                                text: {width: 0, margin: 0, padding: 0, height: 0},
                                icon: {margin: 0, padding: 0, alignSelf: 'center'}
                            }}/>
                </NavBarCustom>
                <View style={style.containerContent}>
                    <AnimatedListView
                        stickyHeaderIndices={[0]}
                        data={this.props.followUps}
                        renderItem={this.renderFollowUp}
                        keyExtractor={this.keyExtractor}
                        ListHeaderComponent={<SearchFilterView style={{
                            transform: [{
                                translateY: navbarTranslate
                            }],
                            opacity: navbarOpacity
                        }}  />}
                        ItemSeparatorComponent={this.renderSeparatorComponent}
                        ListEmptyComponent={this.listEmptyComponent}
                        style={[style.listViewStyle]}
                        componentContainerStyle={style.componentContainerStyle}
                        onScroll={this.handleScroll}
                    />
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    renderFollowUp = ({item}) => {
        if (item.performed) {
            return (
                <FollowUpListItem item={item} />
            )
        } else {
            return (
                <MissedFollowUpListItem item={item} />
            )
        }
    };

    keyExtractor = (item, index) => item.id;

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    calculateTopForDropdown = () => {
        let dim = calculateDimension(98, true, this.props.screenSize);
        return dim;
    };

    listEmptyComponent = () => {
        return (
            <View style={[style.emptyComponent]}>
                <Text style={style.emptyComponentTextView}>There are no follow-ups to display</Text>
                <Button
                    raised
                    upperCase={false}
                    text="Generate for 1 day"
                    color="blue"
                    titleColor="red"
                    onPress={() => {
                        console.log("Ceve")
                    }}
                    style={{
                        text: style.buttonEmptyListText,
                        container: {width: calculateDimension(230, false, this.props.screenSize), height: calculateDimension(35, true, this.props.screenSize)}
                    }}
                />
            </View>
        )
    };

    onSelectValue = (value) => {
        if (value === 'All') {
            this.removeFromFilter({type: 'performed'});
        } else {
            this.appendToFilter({type: 'performed', value});
        }
    };

    handleDayPress = (day) => {
        this.appendToFilter({type: 'date', value: day});
    };


    // Append to the existing filter newProp={name: value}
    appendToFilter = (newProp) => {
        let auxFilter = Object.assign({}, this.state.filter);

        // If the filter exists, check if it has already the wanted props and change them. Otherwise add them
        if (auxFilter) {
           auxFilter[newProp.type] = newProp.value;
        }

        this.setFilter(auxFilter);
    };

    removeFromFilter = (newProp) => {
        let auxFilter = Object.assign({}, this.state.filter);

        if (auxFilter && auxFilter[newProp.type]) {
            delete auxFilter[newProp.type];
        }

        this.setFilter(auxFilter);
    };

    setFilter = (filter) => {
        this.setState({filter}, () => {
            // After setting the filter, we want to apply it
            this.applyFilters();
        });
    };

    applyFilters = () => {
        let filter = {};

        filter.where = {};
        filter.where.and = [];


        if (this.state.filter.date) {
            let oneDay = 24 * 60 * 60 * 1000;
            filter.where.and.push({date: {gt: new Date(this.state.filter.date.getTime() - oneDay)}});
            filter.where.and.push({date: {lt: new Date(this.state.filter.date.getTime() + oneDay)}});
        }

        if (this.state.filter.performed) {
            filter.where.and.push({performed: this.state.filter.performed === 'To do'})
        }

        console.log("### filter: ", filter);

        this.props.getFollowUpsForOutbreakId(this.props.user.activeOutbreakId, filter, this.props.user.token)
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
        backgroundColor: styles.appBackground
    },
    separatorComponentStyle: {
        height: 8
    },
    listViewStyle: {

    },
    componentContainerStyle: {
    },
    emptyComponent: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyComponentTextView: {
        fontFamily: 'Roboto-Light',
        fontSize: 15,
        color: styles.textEmptyList
    },
    buttonEmptyListText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16.8,
        color: styles.buttonTextGray
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        followUps: state.followUps
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getFollowUpsForOutbreakId
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsScreen);
/**
 * Created by florinpopa on 04/07/2018.
 */
/**
 * Created by florinpopa on 14/06/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {TextInput, View, Text, StyleSheet, Platform} from 'react-native';
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
import ElevatedView from 'react-native-elevated-view';
import {Dropdown} from 'react-native-material-dropdown';
import AnimatedListView from './../components/AnimatedListView';


class FollowUpsScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {

        };
        // Bind here methods, or at least don't declare methods in the render method
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }



    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <NavBarCustom title="Follow-ups">
                    <CalendarPicker
                        width={calculateDimension(124, false, this.props.screenSize)}
                        height={calculateDimension(25, true, this.props.screenSize)}
                    />
                    <ElevatedView elevation={2}>
                        <ButtonWithIcons
                            label="To do"
                            width={calculateDimension(124, false, this.props.screenSize)}
                            height={calculateDimension(25, true, this.props.screenSize)}
                            firstIcon="visibility"
                            secondIcon="arrow-drop-down"
                            isFirstIconPureMaterial={true}
                            isSecondIconPureMaterial={true}
                            onPress={this.handlePressDropdown}
                        >
                            <Dropdown
                                ref='dropdown'
                                data={config.dropDownValues}
                                renderAccessory={() => {
                                    return null;
                                }}
                                dropdownOffset={{
                                    top: this.calculateTopForDropdown(),
                                    left: -calculateDimension(110, false, this.props.screenSize)
                                }}
                                dropdownPosition={0}
                            />
                        </ButtonWithIcons>
                    </ElevatedView>
                    <Button raised text="" onPress={() => console.log("Empty button")} icon="add"
                            style={{
                                container: {width: calculateDimension(33, true, this.props.screenSize),height: calculateDimension(25, true, this.props.screenSize), margin: 0, padding: 0},
                                text: {width: 0, margin: 0, padding: 0, height: 0},
                                icon: {margin: 0, padding: 0, alignSelf: 'center'}
                            }}/>
                </NavBarCustom>
                <View style={style.containerContent}>
                    <SearchFilterView/>
                    <AnimatedListView
                        data={this.props.followUps}
                        renderItem={this.renderFollowUp}
                        keyExtractor={this.keyExtractor}
                        ItemSeparatorComponent={this.renderSeparatorComponent}
                        ListEmptyComponent={this.listEmptyComponent}
                        style={style.listViewStyle}
                        componentContainerStyle={style.componentContainerStyle}
                    />
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    renderFollowUp = ({item}) => {
        return (
            <FollowUpListItem item={item} />
        )
    };

    keyExtractor = (item, index) => item.id;

    renderSeparatorComponent = () => {
        return (
            <View style={style.separatorComponentStyle} />
        )
    };

    handlePressDropdown = () => {
        this.refs.dropdown.focus();
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
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsScreen);
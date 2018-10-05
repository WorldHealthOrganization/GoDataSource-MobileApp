/**
 * Created by florinpopa on 03/07/2018.
 */
import React, {Component} from 'react';
import {TextInput, View, StyleSheet, Platform, Dimensions} from 'react-native';
import NavigationDrawerListItem from './../components/NavigationDrawerListItem';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {logoutUser} from './../actions/user';
import {sendDatabaseToServer} from './../actions/app';
import styles from './../styles';
import {ListItem, Icon} from 'react-native-material-ui';

// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box

let height = Dimensions.get('window').height;

class NavigationDrawer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedScreen: 0
        };
        // Bind here methods, or at least don't declare methods in the render method
        this.handlePressOnListItem = this.handlePressOnListItem.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={style.container}>
                <View style={{flex: 0.15, marginTop: Platform.OS === 'ios' ? this.props.screenSize.height === 812 ? 44 : 20 : 0, justifyContent: 'center'}}>
                    <ListItem
                        numberOfLines={2}
                        leftElement={<Icon name="account-circle" size={40} color={styles.buttonGreen} />}
                        centerElement={{primaryText: (this.props.user && this.props.user.firstName ? (this.props.user.firstName + ' ') : '') + (this.props.user && this.props.user.lastName ? this.props.user.lastName : ''), secondaryText: this.props.user && this.props.user.email ? this.props.user.email : ''}}
                        style={{
                            container: {height: '100%'},
                            primaryText: {fontFamily: 'Roboto-Medium', fontSize: 18},
                            secondaryText: {fontFamily: 'Roboto-Regular', fontSize: 12},
                            centerElementContainer: {height: '100%', justifyContent: 'center'}
                        }}
                    />
                    <View style={styles.lineStyle} />
                </View>
                <View style={{flex: 0.35}}>
                    {
                        config.sideMenuItems.map((item, index) => {
                            return (
                                <NavigationDrawerListItem
                                    key={index}
                                    label={item.label} name={item.name}
                                    onPress={() => this.handlePressOnListItem(index)}
                                    handleOnPressAdd={() => this.handleOnPressAdd(item.key, index)}
                                    isSelected={index === this.state.selectedScreen}
                                    addButton={item.addButton}
                                />
                            )
                        })
                    }
                    <View style={styles.lineStyle} />
                </View>
                <View style={{flex: 0.25}}>
                    <NavigationDrawerListItem label={'Sync HUB manually'} name={'cached'} onPress={this.props.sendDatabaseToServer} />
                    <NavigationDrawerListItem label={'Change HUB configuration'} name={'settings'}/>
                    <View style={styles.lineStyle} />
                </View>
                <View style={{flex: 0.15}}>
                    <NavigationDrawerListItem label='Logout' name="power-settings-new" onPress={this.handleLogout} />
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handlePressOnListItem = (index) => {
        this.setState({
           selectedScreen: index
        }, () => {
            this.props.navigator.toggleDrawer({
                side: 'left',
                animated: true,
                to: 'missing'
            });
            this.props.navigator.handleDeepLink({
                link: 'Navigate/' + index
            })
        });
    };

    handleOnPressAdd = (key, index) => {
        console.log(key, index);
        this.setState({
            selectedScreen: index
        }, () => {
            this.props.navigator.toggleDrawer({
                side: 'left',
                animated: true,
                to: 'missing'
            });
            switch(key) {
                case 'contacts':
                    this.props.navigator.handleDeepLink({
                        link: 'Navigate/' + index
                    });
                    break;
                case 'cases':
                    this.props.navigator.handleDeepLink({
                        link: 'Navigate/' + index + '-add'
                    });
                    break;
                default:
                    console.log('Add something from drawer');
                    break;
            }
        });

    };

    handleLogout = () => {
        this.props.logoutUser();
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white'
    },
    textInput: {
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 20,
        flex: 1
    }
});

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        logoutUser,
        sendDatabaseToServer
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(NavigationDrawer);
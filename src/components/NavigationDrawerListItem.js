/**
 * Created by florinpopa on 14/06/2018.
 */
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {ListItem, Icon} from 'react-native-material-ui';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ElevatedView from 'react-native-elevated-view';
import Ripple from 'react-native-material-ripple';
import {calculateDimension} from './../utils/functions';

class NavigationDrawerListItem extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    // Please add here the react lifecycle methods that you need

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={[style.container]}>
                <View style={{flex: this.props.addButton ? 0.8 : 1}}>
                    <ListItem
                        numberOfLines={1}
                        leftElement={<Icon name={this.props.name} color={this.props.isSelected ? styles.buttonGreen : styles.navigationDrawerItemText} />}
                        centerElement={this.props.label}
                        hideChevron={false}
                        onPress={this.props.onPress}
                        style={{
                            container: {
                                backgroundColor: this.props.isSelected ? styles.backgroundGreen : 'white',
                                marginTop: this.props.isSelected ? 7.5 : 0,
                                marginLeft: this.props.isSelected ? 7.5 : 0,
                                marginBottom: this.props.isSelected ? 7.5 : 0,
                                marginRight: this.props.isSelected ? (this.props.addButton ? 0 : 7.5) : 0
                            },
                            primaryText: {fontFamily: 'Roboto-Medium', fontSize: 15, color: this.props.isSelected ? styles.buttonGreen : styles.navigationDrawerItemText}
                        }}
                    />
                </View>
                {this.props.addButton &&
                    <View style={{
                        flex: 0.2,
                        justifyContent: 'center',
                        backgroundColor: this.props.isSelected ? styles.backgroundGreen : 'white',
                        marginTop: this.props.isSelected ? 7.5 : 0,
                        marginBottom: this.props.isSelected ? 7.5 : 0,
                        marginRight: this.props.isSelected ? 7.5 : 0,
                    }}>
                        <ElevatedView
                            elevation={3}
                            style={{
                                backgroundColor: styles.buttonGreen,
                                width: calculateDimension(33, false, this.props.screenSize),
                                height: calculateDimension(25, true, this.props.screenSize),
                                borderRadius: 4
                            }}
                        >
                            <Ripple style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }} onPress={this.props.handleOnPressAdd}>
                                <Icon name="add" color={'white'} size={15}/>
                            </Ripple>
                        </ElevatedView>
                    </View>
                }
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
}

NavigationDrawerListItem.defaultProps = {
    name: 'update',
    label: 'Follow-ups',
    onPress: () => {console.log("Default onPress")},
    handleOnPressAdd: () => {console.log("Default onPressAdd")},
    isSelected: false,
    addButton: false,
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row'
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
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(NavigationDrawerListItem);

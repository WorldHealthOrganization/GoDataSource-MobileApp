/**
 * Created by florinpopa on 16/07/2018.
 */
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {ListItem, Icon, Button} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import Ripple from 'react-native-material-ripple';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './../styles';

let height = Dimensions.get('window').height;
let width = Dimensions.get('window').width;

class ButtonWithIcons extends PureComponent {

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
            <Ripple style={[style.containerButton, Platform.OS === 'android' && {elevation: 2}, {
                width: this.props.width,
                height: this.props.height
            }]} onPress={this.props.onPress}>
                <View style={style.containerInnerView}>
                    {
                        this.props.isFirstIconPureMaterial ? (
                            <Icon size={calculateDimension(15, false, {width, height})} color={styles.buttonGreen} name={this.props.firstIcon}
                                  style={{display: this.props.isFirstIconPureMaterial ? 'flex' : 'none'}}/>
                        ) : (
                            <IconMaterial style={{display: this.props.isFirstIconPureMaterial ? 'none' : 'flex'}}
                                          name={this.props.firstIcon} size={calculateDimension(15, false, {width, height})}
                                          color={styles.buttonGreen}/>
                        )
                    }
                    <Text>{this.props.label}</Text>
                    {
                        this.props.isSecondIconPureMaterial ? (
                            <Icon size={calculateDimension(18, false, {width, height})} color={'black'} name={this.props.secondIcon}
                                  style={{display: this.props.isSecondIconPureMaterial ? 'flex' : 'none'}}/>
                        ) : (
                            <IconMaterial style={{display: this.props.isSecondIconPureMaterial ? 'none' : 'flex'}}
                                          name={this.props.firstIcon} size={calculateDimension(11, false, {width, height})}
                                          color={styles.buttonGreen}/>
                        )
                    }
                </View>
            </Ripple>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
}

ButtonWithIcons.defaultProps = {
    width: 124,
    height: 25,
    firstIcon: "3d-rotation",
    secondIcon: "arrow-drop-down"
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerButton: {
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 4,
        shadowColor: 'gray',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: 4,
        shadowOpacity: 0.8,
    },
    containerInnerView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 9,
        justifyContent: 'space-between',
        flex: 1
    }
});

export default ButtonWithIcons;

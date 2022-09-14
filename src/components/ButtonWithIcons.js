/**
 * Created by florinpopa on 16/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from 'react-native-material-ui';
import {calculateDimension, getTranslation} from './../utils/functions';
import Ripple from 'react-native-material-ripple';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import {connect} from "react-redux";
import styles from './../styles';

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
            <Ripple style={[style.containerButton, {
                width: this.props.width,
                height: this.props.height
            }]} onPress={this.props.onPress}>
                <View style={style.containerInnerView}>
                    {
                        this.props.isFirstIconPureMaterial ? (
                            <Icon size={calculateDimension(15, false, this.props.screenSize)} color={styles.textColor} name={this.props.firstIcon}
                                  style={{display: this.props.isFirstIconPureMaterial ? 'flex' : 'none'}}/>
                        ) : (
                            <IconMaterial style={{display: this.props.isFirstIconPureMaterial ? 'none' : 'flex'}}
                                          name={this.props.firstIcon} size={calculateDimension(15, false, this.props.screenSize)}
                                          color={styles.textColor}/>
                        )
                    }
                    <Text>
                        {getTranslation(this.props.label, this.props.translation)}
                    </Text>
                    {
                        this.props.isSecondIconPureMaterial ? (
                            <Icon size={calculateDimension(18, false, this.props.screenSize)} color={styles.textColor} name={this.props.secondIcon}
                                  style={{display: this.props.isSecondIconPureMaterial ? 'flex' : 'none'}}/>
                        ) : (
                            <IconMaterial style={{display: this.props.isSecondIconPureMaterial ? 'none' : 'flex'}}
                                name={this.props.firstIcon} size={calculateDimension(11, false, this.props.screenSize)}
                                color={styles.textColor}/>
                        )
                    }
                </View>
                {this.props.children}
            </Ripple>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
}

ButtonWithIcons.defaultProps = {
    firstIcon: "3d-rotation",
    height: 30,
    secondIcon: "arrow-drop-down",
    width: 125
};

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerButton: {
        alignItems: 'center',
        backgroundColor: styles.disabledColor,
        borderRadius: 4,
        flexDirection: 'row',
        height: '100%'
    },
    containerInnerView: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

export default connect(mapStateToProps)(ButtonWithIcons);

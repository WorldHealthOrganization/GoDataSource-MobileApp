/**
 * Created by florinpopa on 25/07/2018.
 */
import React, {PureComponent} from 'react';
import {StyleSheet, Text, View} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Icon} from 'react-native-material-ui';
import {calculateDimension, getTranslation} from './../utils/functions';
import Ripple from 'react-native-material-ripple';
import {connect} from "react-redux";
import Modal from 'react-native-modal';
import ElevatedView from "react-native-elevated-view";
import styles from './../styles';

class TooltipComponent extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        let width = calculateDimension(315, false, this.props.screenSize);
        return (
            <View style={[this.props.style ? this.props.style : style.container, {height: 18, width: 18}]}> 
                <ElevatedView elevation={5} style={style.elevatedView}>
                    <Ripple style={style.ripple} onPress={this.handleOnPressTooltip}>
                        <Icon name='help' color={styles.textColor} size={18} />
                    </Ripple>
                </ElevatedView>

                <Modal
                    isVisible={this.state.showModal}
                    style={[style.modal, {
                        width: width,
                        top: this.props.screenSize.height / 4,
                        height: this.props.screenSize.height / 2
                    }]}
                    onBackdropPress={() => this.setState({ showModal: false })}
                >
                    <ElevatedView elevation={5} style={style.modalText}>
                        <Text>
                            {getTranslation(this.props.tooltipMessage, this.props.translation)}
                        </Text>
                    </ElevatedView>
                </Modal>
            </View> 
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleOnPressTooltip = () => {
        this.setState({ showModal: true })
    };
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 0
    },
    elevatedView: {
        borderRadius: 150,
        flex: 1
    },
    ripple: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    modal: {
        alignSelf: 'center',
        backgroundColor: 'transparent',
        borderRadius: 4,
        position: 'absolute',
    },
    modalText: {
        alignItems: 'center',
        backgroundColor: styles.backgroundColor,
        borderRadius: 4,
        color: styles.textColor,
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        justifyContent: 'center',
        padding: 16
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

export default connect(mapStateToProps)(TooltipComponent);

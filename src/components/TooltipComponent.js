/**
 * Created by florinpopa on 25/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import {Icon} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import Ripple from 'react-native-material-ripple';
import styles from './../styles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Modal from 'react-native-modal';
import ElevatedView from "react-native-elevated-view";
import translations from './../utils/translations'
import {getTranslation} from './../utils/functions';

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
            <View style={[style.container, {
                    width: calculateDimension(25, false, this.props.screenSize),
                    height: calculateDimension(25, true, this.props.screenSize),
                }]}
            > 
                <ElevatedView elevation={3} style={style.elevatedView}>
                    <Ripple style={style.ripple} onPress={this.handleOnPressTooltip}>
                        <Icon name='question' color='white' size={15}/>
                    </Ripple>
                </ElevatedView>

                <Modal
                    isVisible={this.state.showModal}
                    style={[style.modal, {
                        width: width,
                        top: this.props.screenSize.height / 4,
                        height: this.props.screenSize.height / 2,
                    }]}
                    onBackdropPress={() => this.setState({ showModal: false })}
                >
                    <ElevatedView elevation={3} style={style.modalText}>
                        <Text style={{marginHorizontal: calculateDimension(5, false, this.props.screenSize)}}>
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
        flex: 0,
        marginTop: 30,
        marginBottom: 8
    },
    elevatedView: {
        flex: 1,
        backgroundColor: styles.buttonBlack,
        borderRadius: 150,
    },
    ripple: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modal: {
        alignSelf: 'center',
        position: 'absolute',
        backgroundColor: 'transparent'
    },
    modalText: {
        backgroundColor: 'white',
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(TooltipComponent);

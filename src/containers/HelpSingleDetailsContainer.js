/**
 * Created by mobileclarisoft on 10/09/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, FlatList, Alert, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import CardComponent from './../components/CardComponent';
import Ripple from 'react-native-material-ripple';
import Button from './../components/Button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import translations from './../utils/translations'

class HelpSingleDetailsContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
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
            <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}} accessible={false}>
                <View style={style.container}>
                    <KeyboardAwareScrollView
                        style={style.containerScrollView}
                        contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                        keyboardShouldPersistTaps={'always'}
                    >
                        {
                            config.helpSingleScreen.details.map((item) => {
                                return this.handleRenderItem(item)
                            })
                        }
                    </KeyboardAwareScrollView>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        let fields = item.fields.map((field) => {
            return Object.assign({},field, {isEditMode: this.props.isEditMode})
        });
        return (
            <CardComponent
                item={fields}
                isEditMode={this.props.isEditMode}
                screen={'HelpSingleScreen'}
                helpItem={this.props.item}
                style={style.cardStyle}
            />
        )
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        alignItems: 'center',
    },
    cardStyle: {
        marginVertical: 4,
        flex: 1
    },
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        role: state.role,
        translation: state.app.translation,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(HelpSingleDetailsContainer);

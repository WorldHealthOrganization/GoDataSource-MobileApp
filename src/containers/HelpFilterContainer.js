/**
 * Created by mobileclarisoft on 12/12/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, Image} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {TextField} from 'react-native-material-textfield';
import Button from './../components/Button';
import styles from './../styles';
import CardComponent from './../components/CardComponent';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import translations from './../utils/translations'

class HelpFiltersContainer extends PureComponent {

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
            <View style={style.container}>
                <KeyboardAwareScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                    keyboardShouldPersistTaps={'always'}
                >
                    {
                        config.helpFilterScreen.filter.map((item) => {
                            return this.handleRenderItem(item);
                        })
                    }
                </KeyboardAwareScrollView>
                <View style={style.containerButtonApplyFilters}>
                    <Button
                        title={getTranslation(translations.generalLabels.applyFiltersButton, this.props.translation)}
                        color={styles.buttonGreen}
                        onPress={this.props.onPressApplyFilters}
                        width={calculateDimension(343, false, this.props.screenSize)}
                        height={calculateDimension(32, true, this.props.screenSize)}
                        style={{alignSelf: 'center'}}
                        titleStyle={{fontFamily: 'Roboto-Medium', fontSize: 14}}
                        titleColor={'white'}
                    />
                </View>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        return (
            <CardComponent
                item={item.fields}
                style={{minHeight: calculateDimension(108, true, this.props.screenSize)}}
                onChangeMultipleSelection={this.props.onChangeMultipleSelection}
                screen="HelpFilter"
                filter={this.props.filter}
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
        borderRadius: 2,
        alignItems: 'center',
    },
    containerButtonApplyFilters: {
        flex: 0,
        justifyContent: 'flex-end',
        marginBottom: 22,
        marginTop: 10
    },
    containerScrollView: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
    },
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        cases: state.cases,
        events: state.events,
        translation: state.app.translation
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(HelpFiltersContainer);

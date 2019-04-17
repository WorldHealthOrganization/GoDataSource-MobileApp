/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, { Component } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { calculateDimension, getTranslation } from '../utils/functions';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styles from '../styles';
import Button from '../components/Button';
import translations from '../utils/translations'
import FollowUpsSingleAddressContainer from './FollowUpsSingleAddressContainer'
import FollowUpsSingleGetInfoContainer from './FollowUpsSingleGetInfoContainer'

class FollowUpsSingleContainer extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // Please add here the react lifecycle methods that you need
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.activeIndex === 0) {
            return true;
        }
        return false;
    }


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log('FollowUpsSingleContainer render Details');
        return (
            <View style={style.container}>
                <Button
                    title={getTranslation(translations.generalButtons.nextButtonLabel, this.props.translation)}
                    onPress={this.props.onNext}
                    color={styles.buttonGreen}
                    titleColor={'white'}
                    height={calculateDimension(25, true, this.props.screenSize)}
                    width={calculateDimension(166, false, this.props.screenSize)}
                    style={{
                        marginVertical: calculateDimension(12.5, true, this.props.screenSize)
                    }}
                />
                <ScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                >
                    <FollowUpsSingleGetInfoContainer
                        isNew={this.props.isNew}
                        isEditMode={this.props.isEditMode}
                        item={this.props.item}
                        contact={this.props.contact}
                        onChangeText={this.props.onChangeText}
                        onChangeDate={this.props.onChangeDate}
                        onChangeSwitch={this.props.onChangeSwitch}
                        onChangeDropDown={this.props.onChangeDropDown}
                    />

                    <FollowUpsSingleAddressContainer
                        item={this.props.item}
                        contact={this.props.contact}
                    />
                </ScrollView>
            </View>
        );
    };
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        alignItems: 'center',
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
        translation: state.app.translation,
        referenceData: state.referenceData,
        locations: state.locations,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsSingleContainer);

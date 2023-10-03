/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {Component} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {connect} from "react-redux";
import get from 'lodash/get';
import constants from './../utils/constants';
import config from './../utils/config';
// import LabResultsSingleAddressContainer from './LabResultsSingleAddressContainer'
import LabResultsSingleGetInfoContainer from './LabResultsSingleGetInfoContainer'
import TopContainerButtons from './../components/TopContainerButtons';
import PermissionComponent from './../components/PermissionComponent';
import styles from '../styles';

class LabResultsSingleContainer extends Component {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // Please add here the react lifecycle methods that you need
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.routeKey === 'genInfo') {
            return true;
        }
        return false;
    }


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        // console.log('LabResultsSingleContainer render Details');
        return (
            <View style={style.container}>
                <PermissionComponent
                    render={() => (
                        <TopContainerButtons
                            isNew={this.props.isNew}
                            isEditMode={this.props.isEditMode}
                            index={this.props.activeIndex}
                            numberOfTabs={this.props.numberOfTabs}
                            onPressEdit={this.props.onPressEdit}
                            onPressSaveEdit={this.props.onPressSaveEdit}
                            onPressCancelEdit={this.props.onPressCancelEdit}
                            onPressNextButton={this.props.onPressNextButton}
                            onPressPreviousButton={this.props.onPressPreviousButton}
                        />
                    )}
                    permissionsList={[
                        constants.PERMISSIONS_LAB_RESULT.labResultAll,
                        constants.PERMISSIONS_LAB_RESULT.labResultCreate,
                        constants.PERMISSIONS_LAB_RESULT.labResultModify
                    ]}
                />

                <ScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
                >
                    <LabResultsSingleGetInfoContainer
                        preparedFields={this.props.preparedFields}
                        isNew={this.props.isNew}
                        isEditMode={this.props.isEditMode}
                        item={this.props.item}
                        contact={this.props.contact}
                        onChangeText={this.props.onChangeText}
                        onChangeDate={this.props.onChangeDate}
                        onChangeSwitch={this.props.onChangeSwitch}
                        onChangeDropDown={this.props.onChangeDropDown}
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
        alignItems: 'center',
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    containerScrollView: {
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', []),
        referenceData: get(state, 'referenceData', [])
    };
}

export default connect(mapStateToProps)(LabResultsSingleContainer);

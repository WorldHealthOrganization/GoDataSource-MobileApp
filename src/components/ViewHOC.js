/**
 * Created by florinpopa on 08/10/2018.
 */
import React, { Component } from 'react';
import { View, Text, ScrollView, Modal, Platform } from 'react-native';
import { LoaderScreen } from 'react-native-ui-lib';
import { Button } from 'react-native-material-ui';
import styles from './../styles';
import config from './../utils/config';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getUserById } from './../actions/user';
import cloneDeep from 'lodash/cloneDeep';
import KeyboardManager  from 'react-native-keyboard-manager';
import ModalSyncStatus from './ModalSyncStatus';
import {setSyncState, setLoaderState} from "../actions/app";

if (Platform.OS === 'ios') {
    KeyboardManager.setEnable(true);
    KeyboardManager.setEnableDebugging(false);
    KeyboardManager.setKeyboardDistanceFromTextField(10);
    KeyboardManager.setPreventShowingBottomBlankSpace(true);
    KeyboardManager.setEnableAutoToolbar(true);
    KeyboardManager.setToolbarDoneBarButtonItemText("Done");
    KeyboardManager.setToolbarManageBehaviour(0);
    KeyboardManager.setToolbarPreviousNextButtonEnable(false);
    KeyboardManager.setShouldToolbarUsesTextFieldTintColor(false);
    KeyboardManager.setShouldShowToolbarPlaceholder(true);
    KeyboardManager.setOverrideKeyboardAppearance(false);
    KeyboardManager.setShouldResignOnTouchOutside(true);
}

class ViewHOC extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            // syncState: cloneDeep(config.manualSyncStages),
            // showLoader: false,
            // showModal: false,
            // showCloseModalButton: false
        };
    }

    // static getDerivedStateFromProps(props, state) {
    //     if (props.syncState && props.syncState.id === 'getData' && props.syncState.status === 'In progress') {
    //         state.showModal = true;
    //     }
    //     if (props.syncState && state.showModal) {
    //         let itemToBeChanged = state.syncState.find((e) => { return e.id === props.syncState.id });
    //         if (itemToBeChanged) {
    //             itemToBeChanged.name = props.syncState.name ? props.syncState.name : itemToBeChanged.name;
    //             itemToBeChanged.error = props.syncState.error || null;
    //             itemToBeChanged.status = props.syncState.status || '...';
    //
    //             let index = state.syncState.map((e) => { return e.id }).indexOf(props.syncState.id);
    //             state.syncState[index] = itemToBeChanged;
    //             if (itemToBeChanged.status === 'Error' || (index === state.syncState.length - 1 && itemToBeChanged.status === 'Success') || itemToBeChanged.status === 'No data to export') {
    //                 state.showCloseModalButton = true;
    //             }
    //         }
    //     }
    //     return null;
    // }

    render() {
        console.log('Selectors logic: ViewHOC: ', this.props.showLoader);
        return (
            <View style={[this.props.style]}>
                {
                    this.props.children
                }
                {
                    this.props.showLoader ? (
                        <LoaderScreen
                            overlay={true}
                            backgroundColor={'rgba(255, 255, 255, 0.8)'}
                            // message={loaderText}
                            message={'Loading'}
                        />
                    ) : (null)
                }
                <ModalSyncStatus
                    showModal={this.props.showModal}
                    syncState={this.props.syncState}
                    showCloseModalButton={this.props.showCloseModalButton}
                    screenSize={this.props.screenSize}
                    closeModal={this.closeModal}
                />
                {/* {
                    Platform.OS === 'ios' ? (
                        <KeyboardAccessoryNavigation
                            nextHidden={true}
                            previousHidden={true}
                        />
                    ) : (null)
                } */}
            </View>
        )
    }

    closeModal = () => {
        if (this.props.syncState[this.props.syncState.length - 1].status === 'Success') {
            // this.resetModalProps(() => {
            //     if (this.props.isMultipleHub) {
            //         this.props.changeAppRoot('login');
            //     } else {
            //         this.props.navigator.push({
            //             screen: 'LoginScreen',
            //             animated: true,
            //             animationType: 'fade'
            //         })
            //     }
            // })
            this.props.setSyncState('Finished')
        } else {
            // this.resetModalProps(() => {
            //     console.log('reset props')
            // })
            this.props.setSyncState('Reset');
        }
    };

    // resetModalProps = (callback) => {
    //     this.setState({
    //         syncState: cloneDeep(config.manualSyncStages)
    //     }, () => {
    //         console.log('sync state: ', this.state.syncState, config.manualSyncStages);
    //         callback();
    //     })
    // }
}

function mapStateToProps(state) {
    const aux = handleChangingSyncState(state.app.syncState);
    const {showModal, showCloseModalButton} = aux;

    let syncState = aux.syncState;
    if (Array.isArray(aux.syncState)) {
        syncState = Object.assign([], aux.syncState);
    } else {
        syncState = aux.syncState;
    }

    return {
        user: state.user,
        screenSize: state.app.screenSize,
        syncState: syncState,
        showModal: showModal,
        showCloseModalButton: showCloseModalButton,
        showLoader: state.app.loaderState
    };
};

let syncStateGlobal = cloneDeep(config.manualSyncStages);

handleChangingSyncState = (syncState) => {
    let returnedValue = {
        showModal: !!(syncState && syncState.id && (syncState.status || syncState.name)),
        syncState: syncStateGlobal,
        showCloseModalButton: false
    };

    if (!syncState || syncState === 'Finished' || syncState === 'Reset') {
        returnedValue = {
            showModal: false,
            syncState: syncState === 'Finished' ? syncState : cloneDeep(config.manualSyncStages),
            showCloseModalButton: false
        }
    } else {
        let itemToBeChanged = returnedValue.syncState.find((e) => {return e.id === syncState.id});
        if (itemToBeChanged) {
            itemToBeChanged.name = syncState.name ? syncState.name : itemToBeChanged.name;
            itemToBeChanged.error = syncState.error || null;
            itemToBeChanged.status = syncState.status || '...';

            let index = syncStateGlobal.findIndex((e) => e.id === syncState.id);
            syncStateGlobal[index] = itemToBeChanged;
            if (itemToBeChanged.status === 'Error' || (index === syncStateGlobal.length - 1 && itemToBeChanged.status === 'Success')) {
                returnedValue.showCloseModalButton = true;
            }
        }
    }

    return returnedValue;
};

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getUserById,
        setSyncState,
        setLoaderState
    }, dispatch);
};

export default connect(mapStateToProps, matchDispatchProps)(ViewHOC);

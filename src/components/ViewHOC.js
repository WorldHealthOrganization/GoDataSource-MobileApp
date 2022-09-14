/**
 * Created by florinpopa on 08/10/2018.
 */
import React, {Component} from 'react';
import {Platform, View} from 'react-native';
import {LoaderScreen} from 'react-native-ui-lib';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {getUserById} from './../actions/user';
import cloneDeep from 'lodash/cloneDeep';
import KeyboardManager from 'react-native-keyboard-manager';
import ModalSyncStatus from './ModalSyncStatus';
import {setLoaderState, setSyncState} from "../actions/app";
import isFunction from 'lodash/isFunction';
import styles from "../styles";

if (Platform.OS === 'ios') {
    KeyboardManager.setEnable(true);
    KeyboardManager.setEnableDebugging(false);
    KeyboardManager.setKeyboardDistanceFromTextField(10);
    KeyboardManager.setPreventShowingBottomBlankSpace(true);
    KeyboardManager.setEnableAutoToolbar(true);
    KeyboardManager.setToolbarDoneBarButtonItemText("Close");
    KeyboardManager.setToolbarManageBehaviour(0);
    KeyboardManager.setToolbarPreviousNextButtonEnable(false);
    KeyboardManager.setShouldToolbarUsesTextFieldTintColor(false);
    KeyboardManager.setShouldShowToolbarPlaceholder(true);
    KeyboardManager.setOverrideKeyboardAppearance(false);
    KeyboardManager.setShouldResignOnTouchOutside(true);
}


class ViewHOC extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <View style={[this.props.style]}>
                {
                    this.props.children
                }
                {
                    this.props.showLoader || this.props.showLoading ? (
                        <LoaderScreen
                            overlay={true}
                            loaderColor={styles.primaryColor}
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
            </View>
        )
    }

    closeModal = () => {
        if (this.props.syncState[this.props.syncState.length - 1].status === 'Success') {
            this.props.setSyncState('Finished');
            this.props.getUserById(this.props.user._id, false);
            if (this.props.refresh && isFunction(this.props.refresh)) {
                this.props.refresh(true);
            }
        } else {
            this.props.setSyncState('Reset');
        }
    };
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
        showLoading: state.app.loaderState
    };
};

let syncStateGlobal = cloneDeep(config.manualSyncStages);

let handleChangingSyncState = (syncState) => {
    let returnedValue = {
        showModal: !!(syncState && syncState.id && (syncState.status || syncState.name)),
        syncState: syncStateGlobal,
        showCloseModalButton: false
    };

    if (!syncState || syncState === 'Finished' || syncState === 'Reset') {
        syncStateGlobal = cloneDeep(config.manualSyncStages);
        returnedValue = {
            showModal: false,
            syncState: syncState === 'Finished' ? syncState : cloneDeep(config.manualSyncStages),
            showCloseModalButton: false
        }
    } else if(syncState === 'addLanguagePacks') {
        syncStateGlobal = [
            {id: 'testApi', name: 'Test API', status: '...'},
            {id: 'downloadDatabase', name: 'Download database', status: '...'},
            {id: 'unzipFile', name: 'Unzip', status: '...'},
            {id: 'sync', name: 'Sync', status: '...'}
        ];
    } else {
        let itemToBeChanged = returnedValue.syncState.find((e) => {return e.id === syncState.id});
        if (itemToBeChanged) {
            itemToBeChanged.name = syncState.name ? syncState.name : itemToBeChanged.name;
            itemToBeChanged.error = syncState.error || null;
            itemToBeChanged.status = syncState.status || '...';

            let index = syncStateGlobal.findIndex((e) => e.id === syncState.id);
            syncStateGlobal[index] = itemToBeChanged;
            if (itemToBeChanged.status === 'Error' || ((index === syncStateGlobal.length - 1 || index === 3) && (itemToBeChanged.status === 'Success' || itemToBeChanged.status === 'No data to export'))) {
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

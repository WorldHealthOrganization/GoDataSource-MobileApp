/**
 * Created by florinpopa on 08/10/2018.
 */
import React, {Component} from 'react';
import {View, Text, ScrollView, Modal, Platform} from 'react-native';
import {LoaderScreen} from 'react-native-ui-lib';
import {Button} from 'react-native-material-ui';
import styles from './../styles';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {getUserById} from './../actions/user';
import cloneDeep from 'lodash/cloneDeep';

class ViewHOC extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
        this.state = {
            syncState: cloneDeep(config.manualSyncStages),
            showLoader: false,
            showModal: false,
            showCloseModalButton: false
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.syncState && props.syncState.id === 'getData' && props.syncState.status === 'In progress') {
            state.showModal = true;
        }
        if (props.syncState && state.showModal) {
            let itemToBeChanged = state.syncState.find((e) => {return e.id === props.syncState.id});
            if (itemToBeChanged) {
                itemToBeChanged.name = props.syncState.name ? props.syncState.name : itemToBeChanged.name;
                itemToBeChanged.error = props.syncState.error || null;
                itemToBeChanged.status = props.syncState.status || '...';

                let index = state.syncState.map((e) => {return e.id}).indexOf(props.syncState.id);
                state.syncState[index] = itemToBeChanged;
                if (itemToBeChanged.status === 'Error' || (index === state.syncState.length - 1 && itemToBeChanged.status === 'Success')) {
                    state.showCloseModalButton = true;
                }
            }
        }
        return null;
    }

    render() {
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
                                message={this.props.loaderText === 'Finished processing' || this.props.loaderText === 'Error' ? 'Loading' : this.props.loaderText}
                            />
                        ) : (null)
                    }
                        <Modal
                            animationType={'slide'}
                            transparent={false}
                            visible={this.state.showModal}
                        >
                                <View style={{flex: 1, backgroundColor: '#55b5a6', alignItems: 'center'}}>
                                        <Text style={{marginTop: 60, fontFamily: 'Roboto-Bold', fontSize: 20, color: 'white'}}>Sync status</Text>
                                        <ScrollView style={{width: '100%'}} contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
                                            {
                                                this.state.syncState.map((item, index) => {
                                                    return (
                                                        <View style={{
                                                            width: '85%',
                                                            justifyContent: 'space-between',
                                                            marginVertical: 8
                                                        }}>
                                                                <View style={{
                                                                    flexDirection: 'row',
                                                                    justifyContent: 'space-between'
                                                                }}>
                                                                        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 16, color: 'white'}}>{item.name}</Text>
                                                                        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 16, color: 'white'}}>{item.status}</Text>
                                                                </View>
                                                                <Text style={{fontFamily: 'Roboto-Medium', fontSize: 16, color: 'white'}}>{item.error}</Text>
                                                        </View>
                                                    )
                                                })
                                            }
                                        </ScrollView>
                                    {
                                        this.state.showCloseModalButton ? (
                                            <View style={{marginBottom: Platform.OS === 'ios' ? this.props.screenSize.height > 812 ? 60 : 20 : 40}}>
                                                    <Button upperCase={false} onPress={this.closeModal} text={'Close'} style={styles.buttonLogin} />
                                            </View>
                                        ) : (null)
                                    }
                                </View>
                        </Modal>
                </View>
            )
    }

    closeModal = () => {
        this.resetModalProps(() => {
            console.log('reset props: ', this.state.syncState);
            this.setState({
                showModal: false,
                showCloseModalButton: false
            }, () => {
                this.props.getUserById(this.props.user._id, null, true);
            })
        })
    };

    resetModalProps = (callback) => {
        this.setState({
            syncState: cloneDeep(config.manualSyncStages)
        }, () => {
            console.log('sync state: ', this.state.syncState, config.manualSyncStages);
            callback();
        })
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        screenSize: state.app.screenSize,
        syncState: state.app.syncState
    };
};

function matchDispatchProps(dispatch) {
    return bindActionCreators({
        getUserById
    }, dispatch);
};

export default connect(mapStateToProps, matchDispatchProps)(ViewHOC);

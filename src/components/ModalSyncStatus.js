/**
 * Created by florinpopa on 04/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, StyleSheet, Platform, ScrollView, Modal} from 'react-native';
import styles from './../styles';
import {Button} from 'react-native-material-ui';

class ModalSyncStatus extends PureComponent {

    // This will be a dumb component, so it's best not to put any business logic in it
    constructor(props) {
        super(props);
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <Modal
                animationType={'slide'}
                transparent={false}
                visible={this.props.showModal}
            >
                <View style={{flex: 1, backgroundColor: '#55b5a6', alignItems: 'center'}}>
                    <Text style={{marginTop: 60, fontFamily: 'Roboto-Bold', fontSize: 20, color: 'white'}}>Sync status</Text>
                    <ScrollView style={{width: '100%'}} contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
                        {
                            this.props && this.props.syncState && Array.isArray(this.props.syncState) && this.props.syncState.map((item, index) => {
                                // console.log('syncState map: ', item);
                                return (
                                    <View style={{
                                        width: '85%',
                                        justifyContent: 'space-between',
                                        marginVertical: 8
                                    }} key={index}>
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
                        this.props.showCloseModalButton ? (
                            <View style={{marginBottom: Platform.OS === 'ios' ? this.props.screenSize.height > 812 ? 60 : 20 : 40}}>
                                <Button upperCase={false} onPress={this.props.closeModal} text={'Close'} style={styles.buttonLogin} />
                            </View>
                        ) : (null)
                    }
                </View>
            </Modal>
        )
    }
}

// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({

});

export default ModalSyncStatus;

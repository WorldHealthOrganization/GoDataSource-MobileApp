/**
 * Created by florinpopa on 04/07/2018.
 */
import React, {PureComponent} from 'react';
import {View, Text, Platform, ScrollView, Modal} from 'react-native';
import {Button} from 'react-native-material-ui';
import styles from './../styles';

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
                <View style={{flex: 1, alignItems: 'center', padding: 24, paddingTop: 48}}>
                    <Text style={{fontFamily: 'Roboto-Bold', fontSize: 24, color: styles.textColor}}>Sync status</Text>
                    <ScrollView style={{width: '100%'}} contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 16, color: styles.textColor, marginBottom: 36}}>
                            Please do not navigate to other applications or close your phone while downloading the database or you will need to restart the process!
                        </Text>
                        {
                            this.props && this.props.syncState && Array.isArray(this.props.syncState) && this.props.syncState.map((item, index) => {
                                // console.log('syncState map: ', item);
                                return (
                                    <View style={{
                                        width: '100%',
                                        justifyContent: 'space-between'
                                    }} key={index}>
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Text style={{fontFamily: 'Roboto-Regular', fontSize: 16, color: styles.secondaryColor}}>{item.name}</Text>
                                            <Text style={{fontFamily: 'Roboto-Regular', fontSize: 16, color: styles.primaryColor}}>{item.status}</Text>
                                        </View>
                                        <Text style={{fontFamily: 'Roboto-Regular', fontSize: 16, color: styles.dangerColor}}>{item.error}</Text>
                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                    {
                        this.props.showCloseModalButton ? (
                            <View style={{marginBottom: Platform.OS === 'ios' ? this.props.screenSize.height > 812 ? 60 : 20 : 40, flexDirection: 'row', justifyContent: 'center'}}>
                                <Button upperCase={false} onPress={this.props.closeModal} text={'Close'} style={styles.primaryButton} />
                            </View>
                        ) : (null)
                    }
                </View>
            </Modal>
        )
    }
}
export default ModalSyncStatus;

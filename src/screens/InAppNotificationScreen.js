/**
 * Created by mobileclarisoft on 15/11/2018.
 */
import React, { Component } from 'react';
import { View, ActivityIndicator, Text, Platform, Dimensions } from 'react-native';
import styles from './../styles';

class InAppNotificationScreen extends Component {

    static navigatorStyle = {
        navBarHidden: true
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={{
                width: Dimensions.get('window').width,
                height: 70,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: styles.buttonGreen
            }}>
                <Text
                    style={{
                        color: 'white',
                        marginTop: Platform.OS === 'ios' ? 20 : 0,
                        fontFamily: 'Roboto-Medium',
                        fontSize: 15
                    }}
                    numberOfLines={1}
                >{this.props.number + " generated follow-ups. "}</Text>
            </View>
        )
    }
}

export default InAppNotificationScreen
/**
 * Created by mobileclarisoft on 15/11/2018.
 */
import React, {Component} from 'react';
import {Dimensions, Platform, Text, View} from 'react-native';
import styles from './../styles';


class InAppNotificationScreen extends Component {

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
                backgroundColor: styles.primaryColor
            }}>
                <Text
                    style={{
                        color: styles.backgroundColor,
                        marginTop: Platform.OS === 'ios' ? 20 : 0,
                        fontFamily: 'Roboto-Medium',
                        fontSize: 16
                    }}
                    numberOfLines={1}
                >{this.props.text}</Text>
            </View>
        )
    }
}

export default InAppNotificationScreen
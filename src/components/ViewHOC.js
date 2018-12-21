/**
 * Created by florinpopa on 08/10/2018.
 */
import React, {Component} from 'react';
import {View} from 'react-native';
import {LoaderScreen} from 'react-native-ui-lib';

ViewHOC = ({style, children, showLoader, loaderText}) => (
        <View style={[style]}>
            {
                children
            }
            {
                showLoader ? (
                    <LoaderScreen 
                        overlay={true} 
                        backgroundColor={'rgba(255, 255, 255, 0.8)'} 
                        // message={loaderText}
                        message={loaderText === 'Finished processing' || loaderText === 'Error' ? 'Loading' : loaderText}
                    />
                ) : (null)
            }
        </View>
);


export default ViewHOC;
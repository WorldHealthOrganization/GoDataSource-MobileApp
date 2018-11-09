/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, FlatList} from 'react-native';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import CardComponent from './../components/CardComponent';
import Button from './../components/Button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

class FollowUpsFiltersContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {

        return (
            <View style={style.container}>
                <Button
                    title={'Next'}
                    onPress={this.props.onNext}
                    color={styles.buttonGreen}
                    titleColor={'white'}
                    height={calculateDimension(25, true, this.props.screenSize)}
                    width={calculateDimension(166, false, this.props.screenSize)}
                    style={{
                        marginVertical: calculateDimension(12.5, true, this.props.screenSize)
                    }}
                />
                <KeyboardAwareScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                    keyboardShouldPersistTaps={'always'}
                >
                    {
                        config.followUpsSingleScreen.generalInfo.map((item) => {
                            return this.handleRenderItem(item)
                        })
                    }
                    <View style={style.container}>
                        {
                            this.props.item && this.props.item.address ? (
                                this.handleRenderItemForAddress()
                            ) : null
                        }
                    </View>
                </KeyboardAwareScrollView>
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        // console.log("Item: ", item);
        return (
            <CardComponent
                item={item.fields}
                followUp={this.props.item}
                contact={this.props.contact}
                style={style.cardStyle}
                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                screen={'FollowUpSingle'}
            />
        )
    }

    handleRenderItemForAddress = () => {
        let fields = config.followUpsSingleScreen.address.fields

        return (
            <CardComponent
                item={fields}
                isEditMode = {false}
                screen={'FollowUpSingle'}
                followUp={this.props.item}
                style={style.cardStyle}
                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onDeletePress={this.props.onDeletePress}
            />
        )
    }
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        alignItems: 'center',
    },
    cardStyle: {
        marginVertical: 4,
        flex: 1
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
        screenSize: state.app.screenSize
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsFiltersContainer);

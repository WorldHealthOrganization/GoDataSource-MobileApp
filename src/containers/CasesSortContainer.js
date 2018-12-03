/**
 * Created by mobileclarisoft on 30/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {TextInput, View, Text, StyleSheet, Platform, Dimensions, Image} from 'react-native';
import {ListItem, Icon} from 'react-native-material-ui';
import {calculateDimension} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {TextField} from 'react-native-material-textfield';
import Button from './../components/Button';
import CardComponent from './../components/CardComponent';
import styles from './../styles';
import Ripple from 'react-native-material-ripple';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ElevatedView from 'react-native-elevated-view';

class CasesSortContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            addSortRuleText: 'Add sort rule'
        };
    }

    // Please add here the react lifecycle methods that you need


    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        return (
            <View style={[style.container]}>
                <Button
                    title={'Back'}
                    onPress={this.props.handleMoveToPrevieousScreenButton}
                    color={styles.buttonGreen}
                    titleColor={'white'}
                    height={calculateDimension(25, true, this.props.screenSize)}
                    width={calculateDimension(130, false, this.props.screenSize)}
                    style={{
                        marginVertical: calculateDimension(12.5, true, this.props.screenSize),
                        marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                    }}/> 
                <KeyboardAwareScrollView
                    style={style.containerScrollView}
                    contentContainerStyle={[style.contentContainerStyle, {paddingBottom: this.props.screenSize.height < 600 ? 70 : 20}]}
                    keyboardShouldPersistTaps={'always'}
                >
                    <View style={style.container}>
                        {
                            this.props.filter && this.props.filter.sort && this.props.filter.sort.map((item, index) => {
                                return this.handleRenderItem(item, index)
                            })
                        }
                    </View>
                    {
                        this.props.filter.sort.length < config.sortCriteriaDropDownItems.length ? 
                            <View style={{alignSelf: 'flex-start', marginHorizontal: calculateDimension(16, false, this.props.screenSize), marginVertical: 20}}>
                                <Ripple
                                    style={{
                                        height: 25,
                                        justifyContent: 'center'
                                    }}
                                    onPress={this.props.onPressAddSortRule}
                                >
                                    <Text style={{fontFamily: 'Roboto-Medium', fontSize: 12, color: styles.buttonGreen}}>
                                        {this.state.addSortRuleText}
                                    </Text>
                                </Ripple>
                            </View> : null
                    }
                </KeyboardAwareScrollView>   
                <View style={style.containerButtonApplyFilters}>
                    <Button
                        title="Apply filters"
                        color={styles.buttonGreen}
                        onPress={this.props.onPressApplyFilters}
                        width={calculateDimension(343, false, this.props.screenSize)}
                        height={calculateDimension(32, true, this.props.screenSize)}
                        style={{alignSelf: 'center'}}
                        titleStyle={{fontFamily: 'Roboto-Medium', fontSize: 14}}
                        titleColor={'white'}
                    />
                </View>         
            </View>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        let fields = config.casesFilterScreen.sort.fields
        return (
            <CardComponent
                item={fields}
                index={index}
                isEditMode={true}
                onChangeDropDown={this.props.onChangeDropDown}
                screen="CasesFilter"
                filter={this.props.filter}
                onDeletePress={this.props.onDeletePress}
                style={style.cardStyle}
                onChangeSectionedDropDown={this.props.onChangeSectionedDropDown}
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
        borderRadius: 2,
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
    containerButtonApplyFilters: {
        flex: 0,
        justifyContent: 'flex-end',
        marginBottom: 22,
        marginTop: 10
    }
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        contacts: state.contacts,
        cases: state.cases,
        events: state.events
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(CasesSortContainer);

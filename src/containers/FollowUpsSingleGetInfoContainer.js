/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, { PureComponent } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { calculateDimension, getTranslation, handleExposedTo, getAddress, extractIdFromPouchId } from '../utils/functions';
import config from '../utils/config';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styles from '../styles';
import CardComponent from '../components/CardComponent';
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';

class FollowUpsSingleGetInfoContainer extends PureComponent {

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
        // console.log('FollowUpsSingleContainer render Details');
        return (
            config.followUpsSingleScreen.generalInfo.map((item) => {
                return this.handleRenderItem(item)
            })
        );
    };

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        let fields = item.fields.map((field) => {
            if (this.props.isNew === false && field.id === 'date') {
                return Object.assign({}, field, { isEditMode: false })
            } else {
                return Object.assign({}, field, { isEditMode: this.props.isEditMode })
            }
        });

        return this.renderItemCardComponent(fields)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView elevation={3} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize),
                marginVertical: 4,
                minHeight: calculateDimension(72, true, this.props.screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                    {
                        fields && fields.map((item, index) => {
                            return this.handleRenderItemCardComponent(item, index, cardIndex);
                        })
                    }
                </ScrollView>
            </ElevatedView>
        );
    };

    handleRenderItemCardComponent = (item, index, cardIndex) => {
        return (
            <View style={[style.subcontainerCardComponent, { flex: 1 }]} key={index}>
                {
                    this.handleRenderItemByType(item, cardIndex)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, cardIndex) => {
        let value = '';

        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForFollowUpSingleScreenDropdownInput(item);
        }

        if (item.type === 'DatePicker' && this.props.item && this.props.item !== undefined && this.props.item[item.id] !== undefined) {
            value = this.props.item[item.id]
        } else if (item.type === 'SwitchInput' && this.props.item && this.props.item !== undefined && this.props.item[item.id] !== undefined) {
            value = this.props.item[item.id]
        } else {
            value = this.computeValueForFollowUpSingleScreen(item);
        }

        if (item.type === 'DatePicker' && value === '') {
            value = null
        }

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode}
                isEditModeForDropDownInput={this.props.isEditMode}
                value={value}
                index={cardIndex}
                followUp={this.props.item}
                contact={this.props.contact}

                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}
            />
        )
    };

    computeValueForFollowUpSingleScreen = (item) => {
        if (item.objectType === 'Address') {
            return this.props.item && this.props.item.address && this.props.item.address[item.id] !== undefined ?
                getTranslation(this.props.item.address[item.id], this.props.translation) : '';
        }
        return this.props.item && this.props.item[item.id] ? getTranslation(this.props.item[item.id], this.props.translation) : '';
    };

    computeDataForFollowUpSingleScreenDropdownInput = (item) => {
        if (item.id === 'statusId') {
            return _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId.includes("LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE") })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
    };
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    containerCardComponent: {
        backgroundColor: 'white',
        borderRadius: 2
    },
    subcontainerCardComponent: {
        alignItems: 'center',
        flex: 1
    },
    container: {
        flex: 1,
        backgroundColor: styles.screenBackgroundGrey,
        alignItems: 'center',
    },
    cardStyle: {
        marginVertical: 4,
        flex: 1
    },
    contentContainerStyle: {
        alignItems: 'center'
    },
});

function mapStateToProps(state) {
    return {
        screenSize: state.app.screenSize,
        translation: state.app.translation,
        referenceData: state.referenceData,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsSingleGetInfoContainer);

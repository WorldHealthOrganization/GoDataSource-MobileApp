/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {calculateDimension, getTranslation} from '../utils/functions';
import config from '../utils/config';
import {connect} from "react-redux";
import styles from '../styles';
import CardComponent from '../components/CardComponent';
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';

class LabResultsSingleGetInfoContainer extends PureComponent {

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
        // console.log('LabResultsSingleContainer render Details');
        return (
            config.labResultsSingleScreen.generalInfo.map((item, index) => {
                return this.handleRenderItem(item, index)
            })
        );
    };

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item, index) => {
        let fields = item.fields.map((field) => {
            if (this.props.isNew === false && field.id === 'date') {
                return Object.assign({}, field, { isEditMode: false })
            } else {
                return Object.assign({}, field, { isEditMode: this.props.isEditMode })
            }
        });

        return this.renderItemCardComponent(fields, index)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView key={cardIndex} elevation={3} style={[style.containerCardComponent, {
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
                    this.handleRenderItemByType(item, index)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, cardIndex) => {
        let value = '';

        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForLabResultSingleScreenDropdownInput(item);
        }

        if (item.type === 'DatePicker' && this.props.item && this.props.item !== undefined && this.props.item[item.id] !== undefined) {
            value = _.get(this.props.item, item.id, null)
        } else if (item.type === 'SwitchInput' && this.props.item && this.props.item !== undefined && this.props.item[item.id] !== undefined) {
            if (item.id === 'fillLocation') {
                value = false;
                if (_.get(this.props, `item[${item.id}].geoLocation.lat`, null) !== null && _.get(this.props, `item[${item.id}].geoLocation.lng`, null) !== null) {
                    value = true;
                }
            } else {
                value = _.get(this.props.item, item.id, null)
            }
        } else {
            value = this.computeValueForLabResultSingleScreen(item);
        }

        if (item.type === 'DatePicker' && value === '') {
            value = null
        }

        if(item.dependsOn){
            // const dependItem = config.labResultsSingleScreen.generalInfo[0].fields.find(e=> e.id === item.dependsOn);
            const dependValue = _.get(this.props.item, item.dependsOn, null);
            if(!!dependValue !== item.showWhenDependence){
                return;
            }
        }

        if (this.props.selectedItemIndexForTextSwitchSelectorForAge !== null && this.props.selectedItemIndexForTextSwitchSelectorForAge !== undefined && item.objectType === 'Case' && item.dependsOn !== undefined && item.dependsOn !== null) {
            let itemIndexInConfigTextSwitchSelectorValues = config[item.dependsOn].map((e) => { return e.value }).indexOf(item.id);
            if (itemIndexInConfigTextSwitchSelectorValues > -1) {
                if (itemIndexInConfigTextSwitchSelectorValues !== this.props.selectedItemIndexForTextSwitchSelectorForAge) {
                    return
                }
            }
        }

        return (
            <CardComponent
                key={cardIndex}
                item={item}
                isEditMode={this.props.isEditMode}
                isEditModeForDropDownInput={this.props.isEditMode}
                value={value}
                index={cardIndex}
                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}
                permissionsList={item.permissionsList}
            />
        )
    };

    computeValueForLabResultSingleScreen = (item) => {
        if (item.objectType === 'Address') {
            return this.props.item && this.props.item.address && this.props.item.address[item.id] !== undefined ?
                getTranslation(this.props.item.address[item.id], this.props.translation) : '';
        }
        return this.props.item && _.get(this.props.item, item.id, null) ? getTranslation(_.get(this.props.item, item.id, null), this.props.translation) : '';
    };

    computeDataForLabResultSingleScreenDropdownInput = (item) => {
        if (item.id === 'status') {
            return  _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId.includes("LNG_REFERENCE_DATA_CATEGORY_LAB_TEST_RESULT_STATUS")})
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
        if (item.id === 'labName') {
            return  _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId.includes("LNG_REFERENCE_DATA_CATEGORY_LAB_NAME")})
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
        if (item.id === 'sampleType') {
            return  _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId.includes("LNG_REFERENCE_DATA_CATEGORY_TYPE_OF_SAMPLE")})
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
        if (item.id === 'testType') {
            return  _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId.includes("LNG_REFERENCE_DATA_CATEGORY_TYPE_OF_LAB_TEST")})
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
        if (item.id === 'result') {
            return  _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId.includes("LNG_REFERENCE_DATA_CATEGORY_LAB_TEST_RESULT")})
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
        if(item.id === 'sequence.labId') {
            return  _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId.includes("LNG_REFERENCE_DATA_CATEGORY_LAB_SEQUENCE_LABORATORY")})
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { label: getTranslation(o.value, this.props.translation), value: o.value } })
        }
        if(item.id === 'sequence.resultId') {
            return  _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId.includes("LNG_REFERENCE_DATA_CATEGORY_LAB_SEQUENCE_RESULT")})
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
        screenSize: _.get(state, 'app.screenSize', config.designScreenSize),
        translation: _.get(state, 'app.translation', []),
        referenceData: _.get(state, 'referenceData', [])
    };
}

export default connect(mapStateToProps)(LabResultsSingleGetInfoContainer);
/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {View, StyleSheet, ScrollView, findNodeHandle} from 'react-native';
import {calculateDimension, getTranslation, handleExposedTo, getAddress, extractIdFromPouchId} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import styles from './../styles';
import CardComponent from './../components/CardComponent';
import Button from './../components/Button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import translations from './../utils/translations'
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
        return (
            <View style={style.container}>
                <Button
                    title={getTranslation(translations.generalButtons.nextButtonLabel, this.props.translation)}
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
                    extraHeight={20 + 81 + 50 + 70}
                    innerRef={ref => {
                        this.scrollFollowUpsSingleGetInfo = ref
                    }}
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
    };

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (item) => {
        let fields = item.fields.map((field) => {
            if (this.props.isNew === false && field.id === 'date') {
                return Object.assign({},field, {isEditMode: false})
            } else {
                return Object.assign({},field, {isEditMode: this.props.isEditMode})
            }
        });

        return this.renderItemCardComponent(fields)
    };

    handleRenderItemForAddress = () => {
        let fields = config.followUpsSingleScreen.address.fields
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
                <ScrollView scrollEnabled={false} style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
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
            <View style={[style.subcontainerCardComponent, {flex: 1}]} key={index}>
                {
                    this.handleRenderItemByType(item, cardIndex)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, cardIndex) => {
        let value = '';

        // if (this.props.item !== null && this.props.item !== undefined && this.props.contact !== undefined && this.props.contact !== null) {
        //     let item = this.props.item;
        //     let contact = this.props.contact;
        //     if (item.type === 'DropdownInput') {
        //         item.data = this.computeDataForDropdown(item, contact);
        //     }
        //     value = this.computeValueForId(item.type, item.id, item, contact);
        // }

        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForFollowUpSingleScreenDropdownInput(item);
        }
        
        if (item.type === 'DatePicker' && this.props.item && this.props.item !== undefined && this.props.item[item.id] !== undefined) {
            value = this.props.item[item.id]
        } else if (item.type === 'SwitchInput' && this.props.item && this.props.item !== undefined && this.props.item[item.id] !== undefined) {
            value = this.props.item[item.id]
        } else if (item.type === 'DropDownSectioned') {
            if (this.props.item && this.props.item.address && this.props.item.address[item.id] && this.props.item.address[item.id] !== "") {
                for (let i = 0; i < this.props.locations.length; i++) {
                    let myLocationName = this.getLocationNameById(this.props.locations[i], this.props.item.address[item.id])
                    if (myLocationName !== null){
                        value = myLocationName
                        break
                    }
                }
            }
        } else {
            value = this.computeValueForFollowUpSingleScreen(item);
        }

        if (item.type === 'DatePicker' && value === '') {
            value = null
        }
        return (
            <CardComponent
                item={item}
                isEditMode={item.objectType === 'Address' ? false : this.props.isEditMode}
                isEditModeForDropDownInput={item.objectType === 'Address' ? false : this.props.isEditMode}
                value={value}
                index={cardIndex}
                followUp={this.props.item}
                contact={this.props.contact}

                onChangeText={this.props.onChangeText}
                onChangeDate={this.props.onChangeDate}
                onChangeSwitch={this.props.onChangeSwitch}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeTextSwitchSelector={this.props.onChangeTextSwitchSelector}
                onFocus={this.handleOnFocus}
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
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId.includes("LNG_REFERENCE_DATA_CONTACT_DAILY_FOLLOW_UP_STATUS_TYPE")
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }
        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE'
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }
    };

    computeDataForDropdown = (item, contact) => {
        if (item.id === 'exposedTo') {
            if (this.props.cases && this.props.cases.length > 0){
                return this.props.cases.map((e) => {return {value: ((e.firstName ? e.firstName : '') + (e.lastName ? (" " + e.lastName) : ''))}});
            }
        }

        if (item.id === 'address') {
            return contact.addresses.map((e) => {return Object.assign({}, e, {value: getAddress(e, true)})});
        }

        if (item.id === 'riskLevel') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId.includes("RISK_LEVEL")
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }

        if (item.id === 'classification') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId.includes("CASE_CLASSIFICATION")
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }

        if (item.id === 'gender') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_GENDER'
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }

        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE'
            }).map((o) => {return {label: getTranslation(o.value, this.props.translation), value: o.value}})
        }

        if (item.id === 'labName') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_LAB_NAME'
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }

        if (item.id === 'sampleType') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_TYPE_OF_SAMPLE'
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }

        if (item.id === 'testType') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_TYPE_OF_LAB_TEST'
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }

        if (item.id === 'result') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_LAB_TEST_RESULT'
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }

        if (item.id === 'status') {
            return _.filter(this.props.referenceData, (o) => {
                return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_LAB_TEST_RESULT_STATUS'
            }).map((o) => {return {value: getTranslation(o.value, this.props.translation), id: o.value}})
        }

        if (item.id === 'categories') {
            return _.filter(this.props.helpCategory, (o) => {
                return o.deleted === false && o.fileType === 'helpCategory.json'
            }).map((o) => {return {label: getTranslation(o.name, this.props.translation), value: o._id}})
        }

        return [];
    };

    getLocationNameById = (element, locationId) => {
        if(extractIdFromPouchId(element._id, 'location') === locationId) {
            return element.name;
        } else {
            if (element.children && element.children.length > 0) {
                let i;
                let result = null;

                for(i=0; result === null && i < element.children.length; i++){
                    result = this.getLocationNameById(element.children[i], locationId);
                }
                return result;
            }
        }
        return null;
    };


    computeValueForId = (type, id, followUp, contact, cases = []) => {
        if (type === 'DropdownInput' && id === 'exposedTo') {
            return handleExposedTo(contact, true, this.props.cases);
        }

        if (type === 'DropdownInput' && id === 'address' && followUp.address) {
            return getAddress(followUp.address, true)
        }

        if (type === 'SwitchInput' && id === "fillGeoLocation") {
            return followUp.fillGeoLocation ? true : false
        }

        if (followUp[id]) {
            if (typeof followUp[id] === 'string' && followUp[id].includes('LNG_')) {
                return getTranslation(followUp[id], this.props.translation);
            } else {
                return followUp[id];
            }
        } else {
            if (contact[id]) {
                if (typeof contact[id] === 'string' && contact[id].includes('LNG_')) {
                    return getTranslation(contact[id], this.props.translation);
                } else {
                    return contact[id];
                }
            } else {
                if(cases[id]){
                    if (typeof cases[id] === 'string' && cases[id].includes('LNG_')) {
                        return getTranslation(cases[id], this.props.translation);
                    } else {
                        return cases[id];
                    }
                }else {
                    return '';
                }
            }
        }
    };

    handleOnFocus = (event) => {
        this.scrollToInput(findNodeHandle(event.target))
    };

    scrollToInput (reactNode) {
        // Add a 'scroll' ref to your ScrollView
        this.scrollFollowUpsSingleGetInfo.props.scrollToFocusedInput(reactNode)
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
        screenSize: state.app.screenSize,
        translation: state.app.translation,
        referenceData: state.referenceData,
        locations: state.locations,
    };
}

function matchDispatchProps(dispatch) {
    return bindActionCreators({
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchProps)(FollowUpsSingleGetInfoContainer);

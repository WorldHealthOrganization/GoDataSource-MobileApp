/**
 * Created by florinpopa on 25/07/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {calculateDimension, extractIdFromPouchId, getTranslation} from '../utils/functions';
import config from '../utils/config';
import {connect} from "react-redux";
import styles from '../styles';
import CardComponent from '../components/CardComponent';
import ElevatedView from 'react-native-elevated-view';
import _ from 'lodash';

class FollowUpsSingleAddressContainer extends PureComponent {

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
                {
                    this.props.item && this.props.item.address ? (
                        this.handleRenderItemForAddress()
                    ) : null
                }
            </View>
        );
    };

    // Please write here all the methods that are not react native lifecycle methods
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

        if (item.type === 'DropDownSectioned') {
            if (this.props.item && this.props.item.address && this.props.item.address[item.id] && this.props.item.address[item.id] !== "") {
                if (this.props.locations) {
                    for (let i = 0; i < this.props.locations.length; i++) {
                        let myLocationName = this.getLocationNameById(this.props.locations[i], this.props.item.address[item.id])
                        if (myLocationName !== null) {
                            value = myLocationName
                            break
                        }
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
                item={Object.assign(item, {isEditMode: false})}
                isEditMode={false}
                isEditModeForDropDownInput={false}
                value={value}
                index={cardIndex}
                onChangeDropDown={() => {}}
                onChangeDate={() => {}}
                onChangeText={() => {}}
                permissionsList={item.permissionsList}
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
        if (item.id === 'typeId') {
            return _.filter(this.props.referenceData, (o) => { return o.active === true && o.categoryId === 'LNG_REFERENCE_DATA_CATEGORY_ADDRESS_TYPE' })
                .sort((a, b) => { return a.order - b.order; })
                .map((o) => { return { value: getTranslation(o.value, this.props.translation), id: o.value } })
        }
    };

    getLocationNameById = (element, locationId) => {
        if (extractIdFromPouchId(element._id, 'location') === locationId) {
            return element.name;
        } else {
            if (element.children && element.children.length > 0) {
                let i;
                let result = null;

                for (i = 0; result === null && i < element.children.length; i++) {
                    result = this.getLocationNameById(element.children[i], locationId);
                }
                return result;
            }
        }
        return null;
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
        referenceData: _.get(state, 'referenceData', []),
        locations: _.get(state, `locations.locationsList`, []),
    };
}

export default connect(mapStateToProps)(FollowUpsSingleAddressContainer);

/**
 * Created by florinpopa on 21/08/2018.
 */
// Since this app is based around the material ui is better to use the components from
// the material ui library, since it provides design and animations out of the box
import React, {PureComponent} from 'react';
import {InteractionManager, ScrollView, StyleSheet, View} from 'react-native';
import {calculateDimension, computeFullName, extractIdFromPouchId, getTranslation} from './../utils/functions';
import config from './../utils/config';
import {connect} from "react-redux";
import CardComponent from './../components/CardComponent';
import ElevatedView from 'react-native-elevated-view';
import get from 'lodash/get';
import styles from './../styles';

class RelationshipContainer extends PureComponent {

    // This will be a container, so put as less business logic here as possible
    constructor(props) {
        super(props);
        this.state = {
            interactionComplete: false
        };
    }

    // Please add here the react lifecycle methods that you need
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.setState({
                interactionComplete: true
            })
        })
    }

    // The render method should have at least business logic as possible,
    // because this will be called whenever there is a new setState call
    // and can slow down the app
    render() {
        if (this.props.preparedFields.relationship.invisible) {
            return null;
        }
        return (
            <ScrollView
                style={style.containerScrollView}
                nestedScrollEnabled={true}
                contentContainerStyle={[style.contentContainerStyle, { paddingBottom: this.props.screenSize.height < 600 ? 70 : 20 }]}
            >
                <View style={style.container}>
                    {
                        this.props.fromRelationshipScreen === true ? (
                            this.renderItemCardComponent(this.props.preparedFields.relationship.fields)
                        ) : (
                                this.handleRenderItem(this.props.preparedFields, null, 0)
                            )
                    }
                </View>
            </ScrollView>
        );
    }

    // Please write here all the methods that are not react native lifecycle methods
    handleRenderItem = (preparedFields, item, index) => {
        if (preparedFields.relationship.invisible) {
            return null;
        }
        let fields = preparedFields.relationship.fields.map((field) => {
            return Object.assign({}, field, { isEditMode: this.props.isEditMode !== undefined && this.props.isEditMode !== null ? this.props.isEditMode : true })
        });
        return this.renderItemCardComponent(fields, index)
    };

    renderItemCardComponent = (fields, cardIndex = null) => {
        return (
            <ElevatedView elevation={5} style={[style.containerCardComponent, {
                marginHorizontal: calculateDimension(16, false, this.props.screenSize),
                marginVertical: 6,
                minHeight: calculateDimension(72, true, this.props.screenSize),
                width: calculateDimension(config.designScreenSize.width - 32, false, this.props.screenSize)
            }, style.cardStyle]}>
                <ScrollView scrollEnabled={false}
                            nestedScrollEnabled={true} style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
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
        if (item.invisible) {
            return null;
        }
        return (
            <View style={[style.subcontainerCardComponent, {flex: 1}]} key={index}>
                {
                    this.handleRenderItemByType(item, cardIndex)
                }
            </View>
        )
    };

    handleRenderItemByType = (item, cardIndex) => {
        let addContactFromCasesScreen = false;
        let value = '';

        if (item.type === 'DropdownInput') {
            item.data = this.computeDataForExposure(item);
        }
        if (item.type === 'SearchableDropdown') {
            if (get(this.props, 'selectedExposure', null) !== null && typeof get(this.props, 'selectedExposure', null) !== 'string') {
                value = computeFullName(get(this.props, 'selectedExposure', null));
            } else {
                value = get(this.props, 'selectedExposure', null);
            }
            item.isEditMode = this.props.fromRelationshipScreen && this.props.addContactFromCasesScreen;
        }

        if (item.type === 'DropdownInput' && item.id === 'clusterId' && this.props.exposure.clusterId) {
            let myCluster = this.props.clusters.filter((e) => {
                return extractIdFromPouchId(get(e, '_id', null), 'cluster') === get(this.props, 'exposure.clusterId', null)
            });
            value = myCluster[0].name
        } else {
            if (item.type !== 'SearchableDropdown') {
                value = this.computeExposureValue(item);
            }
        }

        if (this.props.addContactFromCasesScreen && this.props.addContactFromCasesScreen !== undefined && item.id === 'exposure') {
            addContactFromCasesScreen = true
        }

        if (item.type === 'DatePicker') {
            value = get(this.props, `exposure[${item.id}]`, '')
        }

        if (item.type === 'DatePicker' && value === '') {
            value = null
        }
        let isEditModeForDropDownInput = addContactFromCasesScreen ? false : true

        let dateValidation = this.setDateValidations(item);
        let minimumDate = dateValidation.minimumDate;
        let maximumDate = dateValidation.maximumDate;

        return (
            <CardComponent
                item={item}
                isEditMode={this.props.isEditMode !== undefined && this.props.isEditMode !== null ? this.props.isEditMode : true}
                isEditModeForDropDownInput={isEditModeForDropDownInput}
                value={value}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                index={cardIndex}
                person={this.props.person}
                type={this.props.type}
                onChangeDropDown={this.props.onChangeDropDown}
                onChangeDate={this.props.onChangeDate}
                onChangeText={this.props.onChangeText}
                onChangeSwitch={this.props.onChangeSwitch}
                onSelectExposure={this.props.onSelectExposure}
                relationshipType={this.props.relationshipType}
                onFocus={this.handleOnFocus}
                onBlur={this.handleOnBlur}
                permissionsList={item.permissionsList}
            />
        )
    };

    computeExposureValue = (item) => {
        let value = '';

        value = this.props.exposure[item.id];
        if (item.id === 'exposure') {
            value = get(this.props, 'selectedExposure.fullName', '');
        }
        return getTranslation(value, this.props.translation);
    };

    setDateValidations = (item) => {
        let minimumDate = undefined;
        let maximumDate = undefined;

        if (item.type === 'DatePicker') {
            if (item.id === 'contactDate' || item.id === 'dateOfFirstContact') {
                maximumDate = new Date();
            }
        }

        let dateValidation = { minimumDate, maximumDate }
        return dateValidation
    };

    computeDataForExposure = (item) => {
        let data = [];
        if (item.id === 'clusterId') {
            data = this.props.clusters.map((e) => {
                return {value: e.name, id: extractIdFromPouchId(e._id, 'cluster')}
            })
        }
        if (item.categoryId) {
            data = this.props.referenceData.filter((o) => {
                return (o.active === true && o.categoryId === item.categoryId) && (
                    o.isSystemWide ||
                    !this.props.outbreak?.allowedRefDataItems ||
                    !this.props.outbreak.allowedRefDataItems[o.categoryId] ||
                    this.props.outbreak.allowedRefDataItems[o.categoryId][o.value]
                );
            })
                .sort((a, b) => { return a.order - b.order; })
                .map((e) => { return { value: getTranslation(e.value, this.props.translation), id: extractIdFromPouchId(e._id, 'referenceData') } });
        }
        return data;
    };
}


// Create style outside the class, or for components that will be used by other components (buttons),
// make a global style in the config directory
const style = StyleSheet.create({
    container: {
        flex: 1
    },
    containerCardComponent: {
        backgroundColor: styles.backgroundColor,
        borderRadius: 4
    },
    subcontainerCardComponent: {
        alignItems: 'center',
        flex: 1
    },
    viewContainer: {
        alignItems: 'center',
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    cardStyle: {
        flex: 1,
        marginVertical: 6
    },
    containerScrollView: {
        backgroundColor: styles.screenBackgroundColor,
        flex: 1
    },
    contentContainerStyle: {
        alignItems: 'center'
    }
});

function mapStateToProps(state) {
    return {
        screenSize: get(state, 'app.screenSize', config.designScreenSize),
        translation: get(state, 'app.translation', []),
        referenceData: get(state, 'referenceData', []),
        clusters: get(state, 'clusters', []),
        outbreak: get(state, 'outbreak', null)
    };
}

export default connect(mapStateToProps)(RelationshipContainer);

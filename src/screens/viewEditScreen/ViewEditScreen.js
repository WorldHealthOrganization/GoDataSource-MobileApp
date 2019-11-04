// This will handle rendering
import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {TabBar, TabView, PagerScroll} from 'react-native-tab-view';
import ElevatedView from 'react-native-elevated-view';
import Ripple from 'react-native-material-ripple';
import Menu, { MenuItem } from 'react-native-material-menu';
import { Icon } from 'react-native-material-ui';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import AddSingleAnswerModalScreen from './../AddSingleAnswerModalScreen';
import ViewHOC from './../../components/ViewHOC';
import NavBarCustom from './../../components/NavBarCustom';
import Breadcrumb from './../../components/Breadcrumb';
import {enhanceTabsWithDataHandling} from './withDataHandling';
import {calculateDimension, getTranslation, computeFullName} from "../../utils/functions";
import styles from "../../styles";
import translations from "../../utils/translations";
import config from "../../utils/config";
import lodashGet from "lodash/get";

class ViewEditScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showAddSingleAnswerModalScreen: false
        };
    }


    render() {
        console.log('Test some props: ', this.props.screenSize);
        return (
            <ViewHOC
                     showLoader={this && this.state && this.state.loading}
                     loaderText={this.props && this.props.syncState ? 'Loading' : getTranslation(translations.loadingScreenMessages.loadingMsg, this.props.translation)}
            >
                <NavBarCustom
                    title={null}
                    customTitle={
                        <View
                            style={[style.breadcrumbContainer]}>
                            <Breadcrumb
                                entities={
                                    [
                                        getTranslation(lodashGet(this.props, 'previousScreen', translations.followUpsSingleScreen.title), this.props.translation),
                                        computeFullName(this.props.elementType === 'followUp' ? this.props.additionalData : this.props.element)
                                    ]
                                }
                                navigator={this.props.navigator}
                                onPress={this.handlePressBreadcrumb}
                            />
                            <View style={{ flexDirection: 'row', marginRight: calculateDimension(16, false, this.props.screenSize) }}>
                                <ElevatedView
                                    elevation={3}
                                    style={{
                                        backgroundColor: styles.buttonGreen,
                                        width: calculateDimension(33, false, this.props.screenSize),
                                        height: calculateDimension(25, true, this.props.screenSize),
                                        borderRadius: 4
                                    }}
                                >
                                    <Ripple style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }} onPress={this.goToHelpScreen}>
                                        <Icon name="help" color={'white'} size={15} />
                                    </Ripple>
                                </ElevatedView>
                                {
                                    this.renderNavBarContent()
                                }
                            </View>
                        </View>
                    }
                    navigator={this.props.navigator}
                    iconName="menu"
                    handlePressNavbarButton={this.handlePressNavbarButton}
                />
                <TabView
                    navigationState={this.state}
                    onIndexChange={this.handleOnIndexChange}
                    renderScene={this.handleRenderScene}
                    renderPager={this.handleRenderPager}
                    renderTabBar={this.handleRenderTabBar}
                    useNativeDriver
                />
                {/*<AddSingleAnswerModalScreen*/}
                    {/*showAddSingleAnswerModalScreen={this.state.showAddSingleAnswerModalScreen}*/}
                    {/*item={this.state.newItem}*/}
                    {/*currentAnswers={this.state.currentAnswers}*/}
                    {/*onCancelPressed={this.onCancelPressed}*/}
                    {/*saveCurrentAnswer={this.saveCurrentAnswer}*/}
                    {/*updateCurrentAnswers={this.updateCurrentAnswers}*/}
                {/*/>*/}
            </ViewHOC>
        );
    }

    renderNavBarContent = () => {
        switch (this.props.elementType) {
            case 'followUp':
                return (
                        this.props.role && this.props.role.find((e) => e === config.userPermissions.writeFollowUp) !== undefined ? (
                        <View>
                            <Menu
                                ref="menuRef"
                                button={
                                    <Ripple onPress={this.showMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Icon name="more-vert" />
                                    </Ripple>
                                }
                            >
                                <MenuItem onPress={this.handleEditContact}>
                                    {getTranslation(translations.followUpsSingleScreen.editContactButton, this.props.translation)}
                                </MenuItem>
                            </Menu>
                        </View>
                    ) : null
                );
            case 'contact':

                break;
            case 'case':

                break;
            case 'event':
                break;
            default:
                break
        }
    }
}

ViewEditScreen.propTypes = {
    elementType: PropTypes.oneOf(['followUp', 'contact', 'case', 'event']).isRequired,
    element: PropTypes.object.isRequired,
    additionalData: PropTypes.object,
    index: PropTypes.number,
    isNew: PropTypes.bool,
    refresh: PropTypes.func,
};

ViewEditScreen.defaultProps = {
    additionalData: {},
    index: 0,
    isNew: false,
    refresh: () => {console.log("ViewEditScreenView default refresh")}
};

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    breadcrumbContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});

function mapStateToProps(state) {
    return {
        user: lodashGet(state, 'user', {}),
        outbreakId: lodashGet(state, 'user.activeOutbreakId', null),
        screenSize: lodashGet(state, 'app.screenSize', config.designScreenSize),
        caseInvestigationTemplate: lodashGet(state, 'outbreak.caseInvestigationTemplate', null),
        contactFollowUpTemplate: lodashGet(state, 'outbreak.contactFollowUpTemplate', null),
        translation: lodashGet(state, 'app.translation', null),
        teams: lodashGet(state, 'teams', null)
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({

    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(enhanceTabsWithDataHandling()(ViewEditScreen));

import React, {Component} from 'react';
import {Text} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import lodashIntersection from 'lodash/intersection';
import lodashIsEqual from 'lodash/isEqual';
import lodashMemoize from 'lodash/memoize';
import {checkArrayAndLength} from './../utils/typeCheckingFunctions';

// This component renders another component if the user has the permissions described in the permissionsList prop
class PermissionComponent extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return lodashIsEqual(this.props.permissionsList, nextProps.permissionsList)
    }

    compareFunction = lodashMemoize((permissionsList) => {
        if (!checkArrayAndLength(permissionsList) && !checkArrayAndLength(this.props.outbreakPermissions)) {
            return true;
        }
        if(checkArrayAndLength(this.props.outbreakPermissions)){
            for(const permissionKey of this.props.outbreakPermissions){
                if (!this.props.outbreak[permissionKey]){
                    return false;
                }
            }
        }
        if (permissionsList.every((e) => checkArrayAndLength(e))) {
            for (let elem of permissionsList) {
                if (checkArrayAndLength(elem) && lodashIsEqual(lodashIntersection(elem, this.props.permissions), elem)) {
                    return true;
                }
            }
            return false;
        } else {
            return checkArrayAndLength(lodashIntersection(permissionsList, this.props.permissions));
        }
    });

    render() {
        if (this.compareFunction(this.props.permissionsList)) {
            return this.props.render();
        } else {
            if (this.props.alternativeRender) {
                return this.props.alternativeRender();
            } else {
                return null;
            }
        }
    }
}

PermissionComponent.propTypes = {
    render: PropTypes.func.isRequired,
    permissionsList: PropTypes.arrayOf(PropTypes.oneOf(PropTypes.string, PropTypes.array)).isRequired,
    outbreakPermissions: PropTypes.arrayOf(PropTypes.oneOf(PropTypes.string)),
    alternativeRender: PropTypes.func,
};

PermissionComponent.defaultProps = {
    render: () => (
        <Text>The render function was empty</Text>
    ),
    permissionsList: [],
    alternativeRender: null
};

function mapStateToProps(state) {
    return {
        permissions: lodashGet(state, 'role', []),
        outbreak: lodashGet(state, 'outbreak', null)
    };
}

export default  connect(
    mapStateToProps,
)(PermissionComponent);


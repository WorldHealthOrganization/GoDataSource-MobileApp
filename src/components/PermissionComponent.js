import React, {Component} from 'react';
import { View, Text } from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import lodashIntersection from 'lodash/intersection';
import {checkArrayAndLength} from './../utils/typeCheckingFunctions';

// This component renders another component if the user has the permissions described in the permissionsList prop
class PermissionComponent extends Component {
    render() {
        if (checkArrayAndLength(lodashIntersection(this.props.permissionsList, this.props.permissions))) {
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
    permissionsList: PropTypes.array.isRequired,
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
        permissions: lodashGet(state, 'role', [])
    };
}

export default connect(
    mapStateToProps,
)(PermissionComponent);


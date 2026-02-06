
import React from 'react';

export function withNavigationParams(Component) {
  return function WrappedComponent(props) {
    const { route } = props;
    const params = route?.params || {};
    
    return <Component {...props} {...params} />;
  };
}

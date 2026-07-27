/**
 * Compatibility shim for the legacy Wix `react-native-navigation` API
 * (`Navigation.showModal / push / pop / setStackRoot / dismissAllModals / events`)
 * that lingered in the codebase after the migration to React Navigation 6.
 *
 * Those call sites reference a global `Navigation` that no longer exists
 * ("Property 'Navigation' doesn't exist" crashes). This shim maps them onto the
 * shared `navigationRef` (the same NavigationContainer ref used by
 * navigationActions/navigationAdapter). Combined with `withNavigationParams` on
 * the target screens, the `passProps` become `route.params` and flow into props.
 *
 * Import it in any file that still calls `Navigation.*`:
 *   import Navigation from '../navigation/wixNavigationShim';
 */
import {navigationRef} from '../Root';
import {StackActions} from '@react-navigation/native';

// Normalizes the various legacy argument shapes into { name, passProps }:
//   - createStackFromComponent(...) → { stack: { children: [ { component: { name, passProps } } ] } }
//   - push(id, { component: { name, passProps } })
//   - a bare { name, passProps }
function extractComponent(arg) {
    const component =
        (arg && arg.stack && arg.stack.children && arg.stack.children[0] && arg.stack.children[0].component) ||
        (arg && arg.component) ||
        arg ||
        {};
    return {name: component.name, passProps: component.passProps || {}};
}

const ready = () => navigationRef && navigationRef.isReady && navigationRef.isReady();
const canGoBack = () => ready() && navigationRef.canGoBack();

// No-op listener registry so any (currently commented-out) Navigation.events()
// calls never crash if re-enabled.
const noopListener = {remove() {}};
const eventsRegistry = {
    registerComponentDidAppearListener: () => noopListener,
    registerComponentDidDisappearListener: () => noopListener,
    registerBottomTabSelectedListener: () => noopListener,
    registerNavigationButtonPressedListener: () => noopListener,
    bindComponent: () => noopListener,
};

const Navigation = {
    // Open a screen (legacy modal) → navigate to it in the current stack.
    showModal(arg) {
        const {name, passProps} = extractComponent(arg);
        if (ready() && name) {
            navigationRef.navigate(name, passProps);
        }
    },

    // Push a screen. First arg may be a legacy componentId; the real payload is
    // the last arg. Use StackActions.push to allow drilling into the same screen type.
    push(a, b) {
        const {name, passProps} = extractComponent(b !== undefined ? b : a);
        if (ready() && name) {
            navigationRef.dispatch(StackActions.push(name, passProps));
        }
    },

    // Replace-the-stack-root was used to return to a list after save → navigate,
    // which pops back to the existing list instance when it's already in the stack.
    setStackRoot(a, b) {
        const {name, passProps} = extractComponent(b !== undefined ? b : a);
        if (ready() && name) {
            navigationRef.navigate(name, passProps);
        }
    },

    pop() {
        if (canGoBack()) {
            navigationRef.goBack();
        }
    },

    popToRoot() {
        if (ready()) {
            navigationRef.dispatch(StackActions.popToTop());
        }
    },

    dismissModal() {
        this.pop();
    },

    dismissAllModals() {
        this.pop();
    },

    events() {
        return eventsRegistry;
    },

    // Options/overlays have no direct equivalent here — safe no-ops.
    mergeOptions() {},
    showOverlay() {},
    dismissOverlay() {},
};

export default Navigation;
export {Navigation};

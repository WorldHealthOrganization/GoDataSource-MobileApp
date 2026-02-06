export const Navigation = {
  setRoot: (...args) => {
    console.log('[STUB] Navigation.setRoot called', args);
    return Promise.resolve();
  },
  setDefaultOptions: () => {},
  events: () => ({
    registerAppLaunchedListener: () => {},
  }),
};

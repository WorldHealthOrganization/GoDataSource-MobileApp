import { navigationRef } from '../Root';

export function navigateTo(screen, params = {}) {
  if (!navigationRef.current) {
    console.log('[NAV] navigation not ready');
    return;
  }

  navigationRef.current.navigate(screen, params);
}

export function resetTo(screen, params = {}) {
  if (!navigationRef.current) {
    console.log('[NAV] navigation not ready');
    return;
  }

  navigationRef.current.reset({
    index: 0,
    routes: [{ name: screen, params }],
  });
}

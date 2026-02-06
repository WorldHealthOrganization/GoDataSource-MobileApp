import { navigationRef } from '../Root';
import { screenMap } from '../screens/screenMap';

export function setRoot(root, selectedScreen) {
  if (!navigationRef.current) return;

  let routeName;

  if (screenMap[selectedScreen]) {
    routeName = selectedScreen;
  } else {
    routeName = Object.keys(screenMap)[0]; // fallback
  }

  navigationRef.current.reset({
    index: 0,
    routes: [{ name: routeName }],
  });
}

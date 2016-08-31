import { createAction } from 'redux-actions';

export const changePosition = createAction('CHANGE_POSITION');
export const changeSize = createAction('CHANGE_SIZE');
export const maximizeWindow = createAction('MAXIMIZE_WINDOW');
export const toggleModule = createAction('TOGGLE_MODULE');
export const changezIndex = createAction('CHANGEZ_INDEX');
export const resetLayout = createAction('RESET_LAYOUT');
export const closeShortcuts = () => ({
  type: 'TOGGLE_MODULE',
  payload: 'shortcuts',
});

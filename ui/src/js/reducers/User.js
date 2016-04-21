import { handleActions } from 'redux-actions';

const initialState = { };

export default handleActions({
  USER_LOGGED_IN_WITH_TOKEN: {
    next(state, action) {
      console.log('USER_LOGGED_IN', action, state);
      return { ...action.payload };
    },
    throw(state, action) {
      console.log('USER_LOGGED_IN Fail', action, state);
      return {};
    },
  },

  USER_LOGGED_IN: (state, action) => ({
    ...state,
    ...action.payload,
  }),

  USER_LOGGED_OUT: () => {
    localStorage.removeItem('auth');
    return {};
  },

  CSCC_LOGIN_SUCCESS: (state, action) => ({
    ...state,
    ...action.payload,
  }),

}, initialState);

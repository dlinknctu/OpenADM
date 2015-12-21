import { handleActions } from 'redux-actions';

const initialState = { counter: 0, teams: [], message: '' };

export default handleActions({
  INCREMENT: (state, action) => ({
    ...state,
    counter: state.counter + action.payload,
  }),

  DECREMENT: (state, action) => ({
    ...state,
    counter: state.counter - action.payload,
  }),

  FETCH_DATA: {
    next(state, action) {
      return ({
        ...state,
        message: 'done',
        teams: state.teams.concat(action.payload),
      });
    },
    throw(state, action) {
      return {
        ...state,
        message: action.payload.message,
      };
    },
  },

  FETCH_ROW_DATA: {
    next(state, action) {
      return ({
        ...state,
        message: 'done',
        teams: state.teams.concat(action.payload),
      });
    },
    throw(state, action) {
      return {
        ...state,
        message: action.payload.message,
      };
    },
  },

  POST_USER: {
    next(state, action) {
      return ({
        ...state,
        result: action.result,
        message: 'done',
      });
    },
    throw(state, action) {
      return {
        ...state,
        message: action.payload.message,
      };
    },
  },

}, initialState);

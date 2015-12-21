import { handleActions } from 'redux-actions';

const initialState = { isLoading: false };

export default handleActions({
  // FETCH_ROW_DATA: {
  //   next(state, action) {
  //     return ({
  //       isLoading: false,
  //     });
  //   },
  //   throw(state, action) {
  //     return {
  //       isLoading: false,
  //     };
  //   },
  // },
  //
  FETCH_ROW_DATA: (state) => ({
    ...state,
    isLoading: false,
  }),

  IS_LOADING: (state) => ({
    ...state,
    isLoading: true,
  }),

}, initialState);

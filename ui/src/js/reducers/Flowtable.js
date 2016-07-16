import { handleActions } from 'redux-actions';
import Immutable from 'seamless-immutable';

const initialState = Immutable.from({
  filterString: '',
  visibleField: [],
  flowlist: [{ controller: '', flows: [] }],
  selectFlow: {},
});

export default handleActions({

  TOGGLE_VISIBLE_FIELD: (state, { payload }) => state
    .update('visibleField', arr => {
      const index = arr.indexOf(payload);
      if (index !== -1) {
        return [
          ...arr.slice(0, index),
          ...arr.slice(index + 1),
        ];
      }
      return arr.concat(payload);
    }),

  FLOW_RESP: (state, action) => state
    .update('flowlist', () => action.payload),


  'FLOW/TOP_RESP': (state, action) => state
    .update('flowlist', () => action.payload),

  FLOWTABLE_CLICK: (state, { payload }) => state
    .update('selectFlow', () => payload),

  SIMULATE_RESP: (state) => state
    .set('selectFlow', {}),

}, initialState);

import { combineReducers } from 'redux';
import { LOCATION_CHANGE } from 'react-router-redux';
import Immutable from 'seamless-immutable';
// import Immutable, { fromJS } from 'immutable';
import topology from './topology';
import controllerStatus from './controllerStatus';
import flowtable from './flowtable';
import layout from './layout';
import setting from './setting';
import counter from './counter';

const routeInitialState = Immutable({
  locationBeforeTransitions: null,
});

const routing = (state = routeInitialState, action) => {
  if (action.type === LOCATION_CHANGE) {
    return {
      ...state,
      locationBeforeTransitions: action.payload,
    };
  }
  return state;
};

export default combineReducers({
  routing,
  counter,
  layout,
  topology,
  controllerStatus,
  flowtable,
  setting,
});

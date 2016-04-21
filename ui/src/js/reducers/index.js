import { combineReducers } from 'redux';
import { LOCATION_CHANGE } from 'react-router-redux';
import Immutable, { fromJS } from 'immutable';
import topology from './topology';
import controllerStatus from './controllerStatus';
import flowtable from './flowtable';
import layout from './layout';
import setting from './setting';
import counter from './counter';

const routeInitialState = fromJS({
  locationBeforeTransitions: null,
});

const routing = (state = routeInitialState, action) => {
  if (action.type === LOCATION_CHANGE) {
    return state.merge({
      locationBeforeTransitions: action.payload,
    });
  }
  return state;
};

const combineImmutableReducers = reducers => {
  const combinedReducers = combineReducers(reducers);
  return (state, action) => Immutable.Map(combinedReducers(
    Immutable.Map.isMap(state) ? state.toObject() : state, action
  ));
};
export default combineImmutableReducers({
  routing,
  counter,
  layout,
  topology,
  controllerStatus,
  flowtable,
  setting,
});

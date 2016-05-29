import { combineReducers } from 'redux';
import { LOCATION_CHANGE } from 'react-router-redux';
import Immutable from 'seamless-immutable';
// import Immutable, { fromJS } from 'immutable';
import topology from './Topology';
import controllerStatus from './ControllerStatus';
import flowtable from './Flowtable';
import layout from './Layout';
import setting from './Setting';
import portStatus from './PortStatus';
import counter from './Counter';


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
  portStatus,
});

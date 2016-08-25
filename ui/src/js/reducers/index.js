import { combineReducers } from 'redux';
import { LOCATION_CHANGE } from 'react-router-redux';
import { reducer as toastr } from 'react-redux-toastr';
import Immutable from 'seamless-immutable';
import topology from './Topology';
import controllerStatus from './ControllerStatus';
import flowtable from './Flowtable';
import layout from './Layout';
import setting from './Setting';
import portStatus from './PortStatus';

const routeInitialState = Immutable.from({
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
  toastr,
  routing,
  layout,
  topology,
  controllerStatus,
  flowtable,
  setting,
  portStatus,
});

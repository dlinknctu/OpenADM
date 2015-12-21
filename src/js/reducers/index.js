import { combineReducers } from 'redux';
import { routeReducer as routing } from 'react-router-redux';
import github from './Github';
import apiStatus from './ApiStatus';
import user from './User';
export default combineReducers({
  github,
  apiStatus,
  routing,
  user,
});

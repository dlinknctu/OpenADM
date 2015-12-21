import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';
import rootReducer from '../reducers';
import { history } from '../routes.jsx';
import { syncHistory } from 'react-router-redux';

export default function configureStore(initialState) {
  const reduxRouterMiddleware = syncHistory(history);

  const middleware = [
    promiseMiddleware, reduxRouterMiddleware,
  ];

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middleware)
  );
  return store;
}

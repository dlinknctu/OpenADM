import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  const middleware = [
    thunk, promiseMiddleware,
  ];

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middleware)
  );

  return store;
}

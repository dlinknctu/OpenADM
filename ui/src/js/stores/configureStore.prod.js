import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise';
import { socketIoMiddleware } from '../middlewares/socket';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  const middleware = [
    thunk, promiseMiddleware, socketIoMiddleware,
  ];

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middleware)
  );

  return store;
}

import { createStore, applyMiddleware, compose } from 'redux';
import Immutable from 'seamless-immutable';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise';
import localstorage from 'redux-localstorage';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';
import { socketIoMiddleware } from '../middlewares/socket';

const localStorageConfig = {
  deserialize: (serializedData) => Immutable.from(JSON.parse(serializedData)),
  key: 'openadm',
};

export default function configureStore(initialState, history) {
  const middleware = [
    thunk, promiseMiddleware, routerMiddleware(history), socketIoMiddleware,
  ];

  const store = createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(...middleware),
      localstorage('', localStorageConfig),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  );

  if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  /* eslint-disable global-require */
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');
      store.replaceReducer(nextRootReducer);
    });
  /* eslint-enable global-require */
  }
  return store;
}

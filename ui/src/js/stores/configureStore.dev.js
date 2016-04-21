import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';
import { persistState } from 'redux-devtools';
import DevTools from '../containers/DevTools';

export default function configureStore(initialState, history) {
  const middleware = [
    thunk, promiseMiddleware, routerMiddleware(history),
  ];

  const store = createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(...middleware),
      DevTools.instrument(),
      persistState(
        window.location.href.match(
          /[?&]debug_session=([^&#]+)\b/
        )
      )
    )
  );

  if (module.hot) {
  // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}

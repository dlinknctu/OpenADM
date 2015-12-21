import { createStore, compose, applyMiddleware } from 'redux';
import { persistState } from 'redux-devtools';
import DevTools from '../containers/DevTools';
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
    reduxRouterMiddleware.listenForReplays(store);

  // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}

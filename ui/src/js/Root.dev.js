import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import RootRouter from './routes.jsx';
import DevTools from './containers/DevTools';

const Root = ({ store, history }) => (
  <Provider store={store}>
    <div>
      <RootRouter history={history} />
      <DevTools />
    </div>
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default Root;

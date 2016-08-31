import React from 'react';
import { Provider } from 'react-redux';
import RootRouter from './routes.jsx';

/* eslint-disable react/prop-types */
const Root = ({ store, history }) => (
  <Provider store={store}>
    <RootRouter history={history} />
  </Provider>
);
/* eslint-enable react/prop-types */

export default Root;

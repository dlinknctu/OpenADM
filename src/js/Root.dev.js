import React, { Component } from 'react';
import { Provider } from 'react-redux';
import RootRouter from './routes.jsx';
import DevTools from './containers/DevTools';

export default class Root extends Component {
  render() {
    const { store } = this.props;
    return (
      <Provider store={store}>
        <div>
          <RootRouter />
          <DevTools />
        </div>
      </Provider>
    );
  }
}

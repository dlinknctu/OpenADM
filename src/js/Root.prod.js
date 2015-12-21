import React, { Component } from 'react';
import { Provider } from 'react-redux';
import RootRouter from './routes.jsx';

export default class Root extends Component {
  render() {
    const { store } = this.props;
    return (
      <Provider store={store}>
        <RootRouter />
      </Provider>
    );
  }
}

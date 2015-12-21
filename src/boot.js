import './assets/styles/main.less';
import React from 'react';
import { render } from 'react-dom';
import configureStore from './js/stores/configureStore';
import Root from './js/Root.js';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const store = configureStore();

if (typeof(document) !== 'undefined' && window) {
  window.onload = () => render(
    <Root store={store} />,
    document.getElementById('app')
  );
}

require('../index.html');
// TODO: Require assets here.
// require('../assets/product.png');

var React = require('react');
var APP = React.createFactory(require('./components/App.jsx'));
var injectTapEventPlugin = require("react-tap-event-plugin");

  //Needed for React Developer Tools
  window.React = React;

  //Needed for onTouchTap
  injectTapEventPlugin();

React.render(APP(), document.body);

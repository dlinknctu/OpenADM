import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { routeActions } from 'react-router-redux';
import { UserAuthWrapper } from 'redux-auth-wrapper';
import Master from './Master.jsx';
import Home from './pages/Home.jsx';
import List from './pages/List.jsx';
import About from './pages/About.jsx';
import Login from './pages/Login.jsx';
import App from './containers/App.js';
import NotFound from './pages/NotFound.jsx';

const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.user,
  failureRedirectPath: '/login',
  redirectAction: routeActions.replace,
  wrapperDisplayName: 'UserIsAuthenticated',
  allowRedirectBack: false,
});

export const history = browserHistory;

export default class Root extends React.Component {
  render() {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={Master}>
          <IndexRoute component={Home} />
          <Route path="list" component={List} />
          <Route path="about" component={UserIsAuthenticated(About)} />
          <Route path="redux" component={App} />
          <Route path="login" component={Login} />
        </Route>
        <Route path="*" component={NotFound} />
      </Router>
    );
  }
}

import React, { PropTypes } from 'react';
import { Router, Route, IndexRoute } from 'react-router';
import Master from './Master.jsx';
import Home from './pages/Home.jsx';
import Domain from './pages/Domain.jsx';
import Setting from './pages/Setting.jsx';
import NotFound from './pages/NotFound.jsx';

const handleLeave = () => {
  // console.log('leave route');
};

const RootRouter = ({ history }) => (
  <Router history={history}>
    <Route path="/" component={Master}>
      <Route path="home" component={Home} />
      <IndexRoute component={Domain} />
      <Route path="domain/:domainName" component={Domain} onLeave={handleLeave} />
      <Route path="setting" component={Setting} />
    </Route>
    <Route path="*" component={NotFound} />
  </Router>
);

RootRouter.propTypes = {
  history: PropTypes.object.isRequired,
};

export default RootRouter;

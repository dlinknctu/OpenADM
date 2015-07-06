/*eslint-disable no-unused-vars */

import React from "react";
import { Route, DefaultRoute, NotFoundRoute } from "react-router";

import Master from "./Master.jsx";
import Home from "./components/Home.jsx";
import Domain from "./components/Domain.jsx";
import UDS from "./components/UDS.jsx";
import NotFound from "./components/NotFound.jsx";


module.exports = (
  <Route path="/" handler={Master}>
    <DefaultRoute name="home" handler={Home} />
    <Route name="domain" path="domain/:domainId?" handler={Domain} />
    <Route name="uds" path="uds" handler={UDS} />
    <NotFoundRoute handler={NotFound}/>
  </Route>
);

/*eslint-enable no-unused-vars */

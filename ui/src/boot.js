require('./assets/stlyes/main.less');

import React from "react";
import Router from "react-router";
import MasterRoutes from "./js/routes.jsx";

import injectTapEventPlugin from "react-tap-event-plugin";
injectTapEventPlugin();

if (typeof document !== "undefined" && window) {
  window.onload = function() {
    Router
    .create({
      routes: MasterRoutes,
      // location: Router.HistoryLocation,
      scrollBehavior: Router.ScrollToTopBehavior
    })
    .run((Handler, state) => {
        React.render(<Handler {...state}/>, document.getElementById("app"));
    });

  };
}


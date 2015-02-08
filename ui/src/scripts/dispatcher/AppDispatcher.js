var Dispatcher = require('flux').Dispatcher;
var PayloadSources = require('../constants/TodoConstants.js').PayloadSources;
var assign = require('object-assign');

var AppDispatcher = assign(new Dispatcher() , {
  handleViewAction: function(action){
    this.dispatch({
      source: PayloadSources.VIEW_ACTION,
      action: action
    });
  },
  handleServerAction: function(action){
    this.dispatch({
      source: PayloadSources.SERVER_ACTION,
      action: action
    });
  }
});

module.exports = AppDispatcher;

var AppDispatcher = require('../dispatcher/AppDispatcher.js');
var ActionTypes = require('../constants/TodoConstants.js').ActionTypes;

module.exports = {

  createMessage: function(text){
    AppDispatcher.handleViewAction({
      type: ActionTypes.CREATE_MESSAGE,
      text: text
    });
  },

  removeMessage: function(text){
    AppDispatcher.handleViewAction({
      type: ActionTypes.REMOVE_MESSAGE,
      text: text
    });
  },

  updateMessage: function(text){
    AppDispatcher.handleViewAction({
      type: ActionTypes.UPDATE_MESSAGE,
      text: text
    });
  },

  clickAction: function(text){
    AppDispatcher.handleViewAction({
      type: ActionTypes.CLICK_ACTION,
      text: text,
    });
  }

};
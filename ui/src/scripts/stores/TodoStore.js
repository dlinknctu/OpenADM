var AppDispatcher = require('../dispatcher/AppDispatcher.js');
var TodoConstants = require('../constants/TodoConstants.js');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = TodoConstants.ActionTypes;

var CHANGE_EVENT = 'change';

var _todos = {};

var _pushCount = 0;


function plusCount(){
  _pushCount ++;
}

var TodoStore = assign({}, EventEmitter.prototype, {

  getAll: function() {
    return _todos;
  },

  getCount: function() {
    return _pushCount;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {

    var action = payload.action;
    var text;
    switch(action.type){
      case ActionTypes.CLICK_ACTION:
        plusCount();
        TodoStore.emitChange();
        break;
      case ActionTypes.CREATE_MESSAGE:
        //do create message
        break;
      default:
      //noop
        break;
    }

    return true; // No errors. Needed by promise in Dispatcher.
  })

});

module.exports = TodoStore;
var keyMirror = require('react/lib/keyMirror');

module.exports = {

  ActionTypes: keyMirror({
    CREATE_MESSAGE: null,
    REMOVE_MESSAGE: null,
    UPDATE_MESSAGE: null,
    CLICK_ACTION: null
  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })
};
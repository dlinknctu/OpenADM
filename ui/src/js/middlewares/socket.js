import io from 'socket.io-client';
import { toastr } from 'react-redux-toastr';

let socket;
// Send event to Server.
const SendActions = [
  'SETTING_CONTROLLER',
  'SUBSCRIBE',
  'OTHER',
  'FEATURE',
  'DEBUG',
  'RESET_DATASTORE',
];
// Listen event from Server.
const ReceiveActions = [
  'CONTROLLER',
  'ADDLINK',
  'DELLINK',
  'ADDDEVICE',
  'DELDEVICE',
  'ADDHOST',
  'DELHOST',
  'ADDPORT',
  'DELPORT',
  'PORT_RESP',
  'FLOW_RESP',
  'FLOW/TOP_RESP',
  'FEATURE_RESP',
  'RESET_DATASTORE_RESP',
  'DEBUG_RESP',
  'SETTING_CONTROLLER_RESP',
  'ALL_DATA',
  'SIMULATE_RESP',
  'ADDTAGS_RESP',
  'DELTAGS_RESP',
  // 'PACKET',
];

const notifyRule = /RESP$/;
const matchResponseForNotify = (actionName, payload) => {
  if (!actionName.match(notifyRule)) {
    return;
  }
  if (payload.status !== 'OK') {
    toastr.warning(actionName.toLowerCase().replace(/_/g, ' '), payload.message);
  } else {
    toastr.success(actionName.toLowerCase().replace(/_/g, ' '), payload.message);
  }
};

const createSocket = (store, coreURL) => {
  if (socket && socket.connected) {
    return;
  }
  socket = io.connect(`${coreURL}/websocket`, {
    forceNew: true,
    reconnection: false,
    reconnectionAttempts: 3,
    reconnectionDelay: 3000,
    reconnectionDelayMax: 5000,
  });
  socket.on('connect', () => {
    // after connected turn reconnection on
    socket.io._reconnection = true;  // eslint-disable-line no-underscore-dangle
    toastr.success('websocket', 'Connected');
  });
  window.socket = socket;
  socket.on('connect_error', d => {
    toastr.error('websocket', `Connect error,
      Please check the core url ! Error Message: ${d}`);
  });
  socket.on('error', (d) => {
    toastr.error('websocket', `Error, ${d}`);
  });

  socket.on('disconnect', (d) => {
    toastr.error('websocket', `Server disconnected,
      Please check core is working ! Error Message: ${d}`);
    store.dispatch({
      type: 'LEAVE_SESSION',
    });
  });

  ReceiveActions.forEach(action => {
    socket.on(action, jsonPayload => {
      const payload = JSON.parse(jsonPayload.data);
      matchResponseForNotify(action, payload);
      store.dispatch({
        type: action,
        payload,
      });
    });
  });
};

export const socketIoMiddleware = store => next => action => {
  const result = next(action);

  if (action.type === 'CONNECT_SOCKET') {
    createSocket(store, (action.payload ?
      action.payload.coreURL : store.getState().setting.coreURL
    ));
  }
  if (!socket) {
    toastr.warning('websocket', "socket doesn't inital");
    return result;
  }

  if (SendActions.indexOf(action.type) > -1) {
    if (!socket.connected && action.type !== 'SETTING_CONTROLLER') {
      toastr.warning('websocket', 'Not connected');
      return result;
    }
    socket.emit(action.type, {
      data: action.payload,
    });
  }

  return result;
};

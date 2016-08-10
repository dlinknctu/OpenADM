import io from 'socket.io-client';
import { toastr } from 'react-redux-toastr';

let socket = null;
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
  // 'PACKET',
];

const createSocket = (store, coreURL) => {
  socket = io.connect(`${coreURL}/websocket`, {
    forceNew: true,
    reconnection: false,
  });
  socket.on('connect', () => {
    // after connected turn reconnection on
    socket.io._reconnection = true;  // eslint-disable-line no-underscore-dangle
    toastr.success('websocket', 'connected');
  });
  window.socket = socket;
  socket.on('connect_error', d => {
    toastr.error('websocket connect error', d);
  });
  socket.on('error', (d) => {
    toastr.error('websocket error', d);
  });

  socket.on('disconnect', (d) => {
    console.warn('Server disconnected', d);
    toastr.error('websocket', 'Server disconnected');
    store.dispatch({
      type: 'LEAVE_SESSION',
    });
  });

  ReceiveActions.forEach(action => {
    socket.on(action, payload => {
      store.dispatch({
        type: action,
        payload: JSON.parse(payload.data),
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

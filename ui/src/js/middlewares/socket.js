import io from 'socket.io-client';

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
  // 'ADDPORT',
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
    console.info('websocket connected!');
    // after connected turn reconnection on
    socket.io._reconnection = true;  // eslint-disable-line no-underscore-dangle
  });
  window.socket = socket;

  socket.on('error', (d) => {
    console.info('websocket error!', d);
  });

  socket.on('disconnect', () => {
    console.warn('Server disconnected');
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
    return result;
  }

  if (SendActions.indexOf(action.type) > -1) {
    socket.emit(action.type, {
      data: action.payload,
    });
  }

  return result;
};

import { coreURL } from '../../../config';
import io from 'socket.io-client';

let socket = null;

export const ioInit = store => {
  // socket = io('http://docker.cs.nctu.edu.tw:32773/websocket', { origins: '*' });
  // socket = io('http://cswwwdev.cs.nctu.edu.tw:5000/zylin', { origins: '*' });
  socket = io.connect('http://docker.cs.nctu.edu.tw:32785/websocket');
  socket.on('connect', () => {
    console.info('websocket connected!');
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
  // Listen event from Server.
  const actions = [
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
    // 'PACKET',
  ];

  actions.forEach(action => {
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

  // Send event to Server.
  const actions = [
    'SETTING_CONTROLLER',
    'SUBSCRIBE', 'OTHER',
    'FEATURE',
    'DEBUG',
    'RESET_DATASTORE',
  ];
  if (actions.indexOf(action.type) > -1) {
    socket.emit(action.type, {
      data: action.payload,
    });
  }

  return result;
};

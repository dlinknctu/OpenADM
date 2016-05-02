import { coreURL } from '../../../config';
import io from 'socket.io-client';
import {
  ADD_TOPOLOGY_DEVICE,
  DEL_TOPOLOGY_DEVICE,
  ADD_TOPOLOGY_HOST,
  DEL_TOPOLOGY_HOST,
  ADD_TOPOLOGY_PORT,
  DEL_TOPOLOGY_PORT,
} from '../actions/TopologyAction';

let socket = null;

export const ioInit = store => {
  socket = io(coreURL, { transports: ['websocket'] });

  socket.on('disconnect', () => {
    console.warn('Server disconnected');
    store.dispatch({
      type: 'LEAVE_SESSION',
    });
  });
  // Listen event from Server.
  const actions = [
    ADD_TOPOLOGY_DEVICE,
    DEL_TOPOLOGY_DEVICE,
    ADD_TOPOLOGY_HOST,
    DEL_TOPOLOGY_HOST,
    ADD_TOPOLOGY_PORT,
    DEL_TOPOLOGY_PORT,
  ];

  actions.forEach(action => {
    socket.on(action, payload => {
      store.dispatch({
        type: action,
        payload,
      });
    });
  });
};

export const socketIoMiddleware = store => next => action => {
  const result = next(action);

  // Send event to Server.
  const actions = [];

  if (actions.indexOf(action.type) > -1) {
    const state = store.getState();
    const sessionId = state.session.id;
    socket.emit(action.type, {
      sessionId,
      payload: action.payload,
    });
  }

  return result;
};

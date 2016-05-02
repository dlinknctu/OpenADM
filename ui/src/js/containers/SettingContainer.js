import React from 'react';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
import { connect } from 'react-redux';
import { withHandlers, onlyUpdateForKeys, compose } from 'recompose';
import TopologyContainer from './TopologyContainer';

const NameTextField = onlyUpdateForKeys(['value'])(
  ({ value, changeName }) => (
    <div>
      <TextField
        value={value}
        onChange={(e) => changeName(e.target.value)}
      />
      <RaisedButton label="變更" />
    </div>
  )
);

const counterIncrease = (payload = 5) => ({
  type: 'COUNTER_INCREASE',
  payload,
});

const counterDecrease = (payload = 3) => ({
  type: 'COUNTER_DECREASE',
  payload,
});

const changeName = (name) => ({
  type: 'CHANGE_NAME',
  payload: name,
});

const mapStateToProps = (state) => ({
  topology: state.get('topology').toJS(),
  counter: state.get('counter'),
});

const mapDispatchToProps = (dispatch) => ({
  changeName: (payload) => dispatch(changeName(payload)),
  increase: (payload) => dispatch(counterIncrease(payload)),
  decrease: (payload) => dispatch(counterDecrease(payload)),
  getMockData: () => dispatch({ type: 'GET_MOCK_DATA', payload: null }),
  addNode: () => dispatch({ type: 'ADD_NODE', payload: null }),
});

const SettingContainer = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withHandlers({
    handleIncrease: ({ increase }) => () => increase(5),
    handleDecrease: ({ decrease }) => () => decrease(3),
    handleGetMockData: ({ getMockData }) => () => getMockData(),
    handleAddNode: ({ addNode }) => () => addNode(),
  })
)((props) => (
    <div>
      <TopologyContainer />
      <h1>Setting</h1>
      <RaisedButton label="mock" secondary onClick={props.handleGetMockData} />
      <RaisedButton label="add node" secondary onClick={props.handleAddNode} />
      <pre>{JSON.stringify(props, undefined, 2)}</pre>
      <RaisedButton label="增加" secondary onClick={props.handleIncrease} />
      <RaisedButton label="減少" primary onClick={props.handleDecrease} />
      <NameTextField value={props.counter.get('name')} changeName={props.changeName} />
      <h4>name: {props.counter.get('name')}</h4>
      <h4>count: {props.counter.get('count')}</h4>
    </div>
  )
);

export default SettingContainer;

import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/lib/raised-button';
import Counter from '../components/Counter.jsx';
import SearchBox from '../components/SearchBox.jsx';
import * as GithubAction from '../actions/GithubAction.js';
import LinearProgress from 'material-ui/lib/linear-progress';

class App extends Component {
  constructor(props) {
    super(props);
    this.onInClick = this.onInClick.bind(this);
    this.onDeClick = this.onDeClick.bind(this);
    this.onGetClick = this.onGetClick.bind(this);
    this.onPostUser = this.onPostUser.bind(this);
  }

  onInClick() {
    this.props.increment(1);
  }

  onDeClick() {
    this.props.decrement(1);
  }

  onGetClick() {
    this.props.isLoading();
    this.props.fetchRowData(10);
  }

  onPostUser() {
    const mock = { name: 'what', age: 30 };
    this.props.postUser(mock);
  }

  render() {
    const isLoading = this.props.apiStatus.isLoading ?
      <LinearProgress
        color={"rgb(255, 0, 20)"}
        mode="indeterminate"
        style={{
          position: 'fixed',
          top: '64px',
          left: '0px',
        }}
      /> : '';

    const teamMembers = this.props.github.teams.map((data, index) => (
      <li key={index + Math.random()}>{data.fname} {data.lname}</li>
    ));

    return (
      <div>
        <h1>Redux Container component</h1>
        <h4>Message: {this.props.github.message || 'default' }</h4>
        <SearchBox />
        <Counter
          increment={this.onInClick}
          decrement={this.onDeClick}
        />
        <RaisedButton
          label="Fetch"
          style={{ margin: 12 }}
          onClick={this.onGetClick}
          secondary
        />
        <RaisedButton
          label="Post"
          style={{ margin: 12 }}
          onClick={this.onPostUser}
          secondary
        />
        <h1>display: {this.props.github.counter}</h1>
        <ul>
          {teamMembers}
        </ul>
        { isLoading }
      </div>
    );
  }
}

App.propTypes = {
  todos: PropTypes.array,
  github: PropTypes.object.isRequired,
  apiStatus: PropTypes.object.isRequired,
  increment: PropTypes.func.isRequired,
  decrement: PropTypes.func.isRequired,
  isLoading: PropTypes.func.isRequired,
  fetchRowData: PropTypes.func.isRequired,
  postUser: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    github: state.github,
    apiStatus: state.apiStatus,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(GithubAction, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

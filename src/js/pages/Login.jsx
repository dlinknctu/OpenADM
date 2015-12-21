import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import * as AuthAction from '../actions/AuthAction';

class Login extends Component {
  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentWillMount() {
    console.log("componentWillMount", this.props, this.context.router);
    const { replace }  = this.context.router;
    const { location } = this.props;

    let token = '';

    if (location.query.token) {
      token = location.query.token;
      localStorage.setItem('auth', token);
      replace(location.pathname);
    } else if (localStorage.getItem('auth')) {

    } else {
      // window.location.href = "https://www.cs.nctu.edu.tw/cscc/cslogin/auth/login";
    }

    if (localStorage.getItem('auth')) {
      this.props.userLoggedInWithToken(localStorage.getItem('auth'));
    }
  }

  handleLogin() {
    console.log(this.refs);
    const username = this.refs.username.getValue();
    const password = this.refs.password.getValue();

    this.props.userLoggedIn({
      username,
      password,
    });
  }

  handleLogout() {
    const token = localStorage.getItem('auth');
    console.log("logout with ", token)
    debugger;
    this.props.userLoggedOut(token);
  }

  render() {
    return (
      <div>
        <h1>Login Page</h1>
          <TextField
            ref="username"
            hintText="Account"
          />
          <TextField
            ref="password"
            hintText="Password"
          />
        <RaisedButton label="Login"
          secondary
          onClick={this.handleLogin}
        />
        <RaisedButton label="Logout"
          secondary
          onClick={this.handleLogout}
        />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AuthAction, dispatch);
}

Login.propTypes = {
  userLoggedInWithToken: PropTypes.func.isRequired,
  userLoggedIn: PropTypes.func.isRequired,
  userLoggedOut: PropTypes.func.isRequired,
};

Login.contextTypes = {
  router: React.PropTypes.object,
};

export default connect(s => s, mapDispatchToProps)(Login);

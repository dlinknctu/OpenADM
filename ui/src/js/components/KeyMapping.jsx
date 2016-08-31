import React, { Component } from 'react';
import { keyMap } from '../constant/moduleMapping';

class KeyMapping extends Component {
  componentDidMount() {
    document.body.onkeypress = (e) => {
      if (e.key === 'r')
        this.props.resetLayout();
      else if (keyMap[e.key])
        this.props.togglePanel(keyMap[e.key]);
    };
  }
  componentWillUnmount() {
    document.body.onkeypress = () => null;
  }
  render() {
    return null;
  }
}

export default KeyMapping;

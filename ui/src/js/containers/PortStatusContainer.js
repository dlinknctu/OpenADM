import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class PortStatusContainer extends Component {
  render() {
    return (
      <div>
        <h2>PortStatusContainer</h2>
        <pre>{JSON.stringify(this.props, null, 2)}</pre>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  flowlist: state.flowtable.flowlist,
});

export default connect(mapStateToProps)(PortStatusContainer);

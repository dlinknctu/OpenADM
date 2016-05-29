import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class FlowtableContainer extends Component {
  render() {
    return (
      <div>
        <h2>FlowtableContainer</h2>
        <pre>{JSON.stringify(this.props, null, 2)}</pre>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  flowlist: state.flowtable.flowlist,
});

export default connect(mapStateToProps)(FlowtableContainer);

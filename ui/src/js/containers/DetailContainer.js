import React, { PropTypes } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withHandlers } from 'recompose';
import Detail from '../components/Detail.jsx';

const DetailContainer = ({ selectNodes }) => {
  return (
    <div>
      <h3>Detail Panel</h3>
      {(selectNodes.length === 0) ?
        <span style={{ color: 'red' }}>You don't select any nodes! </span> :
        <Detail nodes={selectNodes} />
      }
    </div>
  );
};

DetailContainer.propTypes = {
};

export default connect(s => ({
  selectNodes: s.topology.selectNodes,
}))(DetailContainer);

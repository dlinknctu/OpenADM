import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { VictoryPie } from 'victory';

const ControllerContainer = ({ controllerStatus }) => {
  const status = controllerStatus.map( (d, i) =>
    <VictoryPie
      key={`${i}-${d.controller}`}
      style={{
        height: '100px',
        width: '100px',
      }}
      endAngle={90}
      innerRadius={140}
      padAngle={5}
      startAngle={-90}
      data={[
        { x: 'mem_used', y: parseFloat(d.mem_used) * 1024 },
        { x: 'mem_free', y: parseFloat(d.mem_free) },
      ]}
      animate={{
        duration: 1000,
        onEnter: {
          duration: 500,
          before: () => ({ y: 0 }),
          after: (datum) => ({ y: datum.y }),
        },
      }}
    />
  );
  return (
    <div>
      <pre>{JSON.stringify(controllerStatus, null, 2)}</pre>
      {status}
    </div>
  );
};

const mapStateToProps = (state) => ({
  controllerStatus: state.controllerStatus,
});


ControllerContainer.propTypes = {
  controllerStatus: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(ControllerContainer);

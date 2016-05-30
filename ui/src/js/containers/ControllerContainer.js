import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { VictoryPie } from 'victory';
import { Tabs, Tab } from 'material-ui/Tabs';
import InfoIcon from 'material-ui/svg-icons/action/info';
import { List, ListItem } from 'material-ui/List';

const TabContent = ({ cs }) => (
  <List>
    {Object.keys(cs).map( (key, i) =>
      <ListItem key={`key-${i}`} primaryText={`${key}: ${cs[key]}`} />
    )}
  </List>
)

const ControllerContainer = ({ controllerStatus }) => {
  const alltab = controllerStatus.map(d =>(
      <Tab
        key={`key-${d.controller}`}
        icon={<InfoIcon />}
        label={d.controller}
      >
      <TabContent cs={d} />
    </Tab>
  ));
  return (
    <div>
      <Tabs>{alltab}</Tabs>
      {(controllerStatus.length) > 0 ? '' : <h1>Controller</h1>}
    </div>
  );
};

// const ControllerContainer = ({ controllerStatus }) => {
//   const status = controllerStatus.map( (d, i) =>
//     <VictoryPie
//       key={`${i}-${d.controller}`}
//       style={{
//         height: '100px',
//         width: '100px',
//       }}
//       endAngle={90}
//       innerRadius={140}
//       padAngle={5}
//       startAngle={-90}
//       data={[
//         { x: 'mem_used', y: parseFloat(d.mem_used) * 1024 },
//         { x: 'mem_free', y: parseFloat(d.mem_free) },
//       ]}
//       animate={{
//         duration: 1000,
//         onEnter: {
//           duration: 500,
//           before: () => ({ y: 0 }),
//           after: (datum) => ({ y: datum.y }),
//         },
//       }}
//     />
//   );
//   return (
//     <div>
//       <TabsExampleIconText />
//       <pre>{JSON.stringify(controllerStatus, null, 2)}</pre>
//     </div>
//   );
// };

const mapStateToProps = (state) => ({
  controllerStatus: state.controllerStatus,
});


ControllerContainer.propTypes = {
  controllerStatus: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(ControllerContainer);

import React, { PropTypes } from 'react';
import IconButton from 'material-ui/IconButton';
import GroupAddIcon from 'material-ui/svg-icons/social/group-add';
import { onlyUpdateForKeys, compose } from 'recompose';
import { List, ListItem } from 'material-ui/List';
import Tagging from './Tagging.jsx';

const styles = {
  panelBtn: {
    marginLeft: '180px',
  },
  textIcon: {
    padding: '0 20 0 0',
    verticalAlign: 'middle',
  },
};
const enhance = compose(
  onlyUpdateForKeys(['nodes'])
);

const ignoreAttribe = ['x', 'y', 'px', 'py', 'weight', 'index'];

const Detail = ({ nodes = [] }) => {
  const pruneNode = nodes.map(node => node.without(ignoreAttribe));
  return (
    <div>
      <div>
        <Tagging />
      </div>
      <div>
        {pruneNode.map((node, i) => <List key={`ul-${i}`}>
          {Object.keys(node).map(key =>
            <ListItem key={`item-${key}`} primaryText={`${key}: ${node[key]}`} />
          )}
        </List>
        )}
      </div>
    </div>
  );
};

Detail.propTypes = {
  nodes: PropTypes.array,
};

export default enhance(Detail);

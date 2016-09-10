import React, { PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import GroupAddIcon from 'material-ui/svg-icons/social/group-add';

import TextField from 'material-ui/TextField';
import { withHandlers, withState, compose } from 'recompose';

const enhance = compose(
  withState('dailogOpen', 'toggleDailog', false),
  withState('tagText', 'setTagText', ''),
  withHandlers({
    toggleDailog: props => () => {
      props.toggleDailog(!props.dailogOpen);
    },
    onTagTextChange: props => event => {
      props.setTagText(event.target.value);
    },
  })
);

const Tagging = ({
  tagText,
  toggleDailog,
  dailogOpen,
  onTagTextChange,
}) => {
  const actions = [
    <FlatButton label="Cancel" primary={true} onTouchTap={toggleDailog} />,
    <RaisedButton label="Submit" primary={true} disabled={true} onTouchTap={toggleDailog} />,
  ];
  return (
    <div>
      <IconButton
        tooltipPosition="bottom-left"
        tooltip="Tagging"
        onClick={toggleDailog}
      >
        <GroupAddIcon />
      </IconButton>
      <Dialog
        title="Taggin the select nodes"
        modal
        open={dailogOpen}
        actions={actions}
      >
        <h3>You select xxxx</h3>
        <TextField
          hintText="String"
          floatingLabelText="tag"
          onChange={onTagTextChange}
          defaultValue={tagText}
        />
      </Dialog>
    </div>
  );
};

Tagging.propTypes = {};

export default enhance(Tagging);

import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';
import { LinearProgress } from 'material-ui';

class List extends React.Component {
  constructor(props) {
    super(props);
    this.onDialogClose = this.onDialogClose.bind(this);
    this.onDialogSubmit = this.onDialogSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleProgress = this.handleProgress.bind(this);
    this.state = {
      isProgress: false,
      open: false,
    };
  }

  onDialogSubmit() {
    this.setState({ open: false });
  }

  onDialogClose() {
    this.setState({ open: false });
  }

  handleProgress() {
    this.setState({
      isProgress: !this.state.isProgress,
    });
  }

  handleClick() {
    this.setState({ open: true });
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        secondary
        onTouchTap={this.onDialogClose}
      />,
      <FlatButton
        label="Submit"
        primary
        onTouchTap={this.onDialogSubmit}
      />,
    ];

    return (
          <div>
            <h1>Here is List</h1>
            <RaisedButton label="Primary" primary
              onTouchTap={this.handleClick}
            />
            <RaisedButton label="Secondary" secondary
              onTouchTap={this.handleProgress}
            />
            <Dialog
              open={this.state.open}
              title="Dialog With Standard Actions"
              ref="dailog"
              actions={actions}
            >
              The actions in this window are created from the json that's passed in.
            </Dialog>
            { (this.state.isProgress) ? <LinearProgress mode="indeterminate" />
            : false }
          </div>
      );
  }
}

module.exports = List;

import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

const menuItems = [ 'ADD', 'MOD', 'MOD_ST', 'DEL', 'DEL_ST'];

const Style = {
  wrapperStyle: {
    style: { display: 'table' },
  },
  textFieldStyle: {
    style: { float: 'left', width: '45%', marginRight: 10 },
  },
}

class Flowmod extends Component {
  constructor(props) {
    super(props);
    this.state = {
      command: 'ADD',
    }
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event, index, value) {
  console.log('handleChange', value);
    this.setState({
      command: value,
    })
  }
  handleSubmitFlowmod = (event) => {
    /**
     * Input all refs and get the value object
     */
    this.refs.command.getValue = () => this.refs.command.props.value;
    const modFlow = Object.keys(this.refs)
      .map(k => ({ [k]: this.refs[k].getValue()}) )
      .reduce((pre, cur) => Object.assign(pre,cur));
      console.log('handleSubmitFlowmod', modFlow);
    this.props.submiteFlowmod(modFlow);
  }
  render() {
    const { field = [], selectedFlow = {}, showAction, toggleAction } = this.props;
    const actions = [
      <FlatButton label="Close" primary onTouchTap={toggleAction} />,
      <FlatButton label="Submit" primary onTouchTap={this.handleSubmitFlowmod} />,
    ]
    return (
      <Dialog
        title="Flow Modify"
        autoScrollBodyContent
        actions={actions}
        open={showAction}
      >
        <div>
          <h3>Please fill the correct field format</h3>
          <div>
            <DropDownMenu value={this.state.command} onChange={this.handleChange} ref='command'>
            {menuItems.map(d => <MenuItem key={d} value={d} primaryText={d} />)}
            </DropDownMenu>
          </div>
          <div {...Style.wrapperStyle}>
          {
            Object.keys(field)
            .map( (d, i) =>
              <TextField {...Style.textFieldStyle} key={`text-${i}`} floatingLabelText={d} hintText={field[d]} defaultValue={selectedFlow[d]} ref={d} />
            )
          }
          </div>
        </div>
      </Dialog>
    );
  }
}

Flowmod.propTypes = {
  PROPS_NAME: PropTypes.string
};

export default Flowmod;

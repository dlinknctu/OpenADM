require("../../assets/stylesheets/main.less");
var React = require('react');
var material = require('material-ui');
var InputBox = require('./InputBox.jsx');
var ListView = require('./ListView.jsx');
var RaisedButton = material.RaisedButton;
var Slider = material.Slider;
var LeftNav = material.LeftNav;
var Menu = material.Menu;
var MenuItem = material.MenuItem;
var Dialog = material.Dialog;
var Toolbar = material.Toolbar;
var ToolbarGroup = material.ToolbarGroup;
var Icon = material.Icon;
var DropDownIcon = material.DropDownIcon;
var AppBar = material.AppBar;
var AppCanvas = material.AppCanvas;
var Paper = material.Paper;
var Toggle = material.Toggle;
var TodoListActionCreator = require('../actions/TodoListActionCreator.js');
var TodoStore = require('../stores/TodoStore.js');

var APP = React.createClass({

  getInitialState: function() {
    return { pushCount: TodoStore.getCount() };
  },

  handleOver: function(e){
    this.refs.leftNav.toggle();
  },
  handleClick: function(){
    TodoListActionCreator.clickAction('qaa');
  },
  _showDialog: function(){
    this.refs.dialogExample.show();
  },

  _onChange: function(){
    console.log('Reload');
    this.setState({ pushCount: TodoStore.getCount() });
  },

  componentDidMount: function() {
    TodoStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    TodoStore.removeChangeListener(this._onChange);
  },

  render: function(){

    var menuItems = [
      { route: 'get-started', text: 'Get Started' },
      { route: 'css-framework', text: 'CSS Framework' },
      { route: 'components', text: 'Components' },
      { type: MenuItem.Types.SUBHEADER, text: 'Resources' },
      {
         type: MenuItem.Types.LINK,
         payload: 'https://github.com/callemall/material-ui',
         text: 'GitHub'
      },
      {
        type: MenuItem.Types.NESTED,
        text: 'Nesteds',
        items: [
        {
          type: MenuItem.Types.LINK,
          payload: '1',
          text: 'some'
        },
        {
          type: MenuItem.Types.LINK,
          payload: '2',
          text: 'thing'
        }]
      }
    ];

    var dialogActions = [
      { text: 'CANCEL' },
      { text: 'yoo', className: 'Black', onClick: this._handleTest },
      { text: 'SUBMIT', onClick: this._onDialogSubmit }
    ];

    var title = '標題';
    var simpleData = [
      { id: 0, text: '寫作業', isDone: false },
      { id: 1, text: '吃飯', isDone: true },
      { id: 2, text: '運動', isDone: false }];

    return (
      <AppCanvas predefinedLayout={1}>
        <AppBar
          className="mui-dark-theme"
          onMenuIconButtonTouchTap={this.handleOver}
          title={title}
          zDepth={2} />
        <div className="container">
        <br /><br /><br /><br /><br />

          <div className="row">
            <Paper zDepth={5} rounded={false}>
              <h1>myapp</h1>
              <Toggle toggled={true} label={"hello"} />

              <RaisedButton label="按的" primary={true} secondary={true} onTouchTap={this.handleClick} />
              <div>按鍵次數 = {this.state.pushCount} =</div>
              <RaisedButton label="Primary" primary={true}
              onMouseOver={this.handleOver} />
              <RaisedButton label="Secondary" secondary={true} onClick={this._showDialog} />


              <LeftNav ref="leftNav" docked={false} menuItems={menuItems}/>
              <Dialog
                ref="dialogExample"
                title="Title"
                actions={dialogActions}>

                This is an example of a dialog component built with Facebook's React and following
                Google's Material Design principles.
              </Dialog>

              <p>Hello React and react</p>
              <RaisedButton label="Super Secret Password" primary={true} onTouchTap={this._handleTouchTap} />
              <InputBox />
                <ListView todoList={simpleData} />
            </Paper>
          </div>
        </div>
      </AppCanvas>
    );
  }
});

module.exports = APP;
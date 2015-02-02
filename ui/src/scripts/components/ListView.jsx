var React = require('react');
var ListItem = require('./ListItem.jsx');
var TodoListActionCreator = require('../actions/TodoListActionCreator.js');

var ListView = React.createClass({

  propTypes: {
    todoList: React.PropTypes.array.isRequired
  },

  RemoveItem: function(evt){
    TodoListActionCreator.createMessage('message');
  },

  render: function(){
  var listItem = this.props.todoList.map(function(item,j){
    return <ListItem key={j} text={item.text} isDone={item.isDone} onRemove={this.RemoveItem.bind(this, j)} />;
  }.bind(this));

    return (
    <div className="panel panel-default">
      <div className="panel-heading">待辦事項</div>
      <div className="panel-body">{listItem}</div>
    </div>
    );
  }
});

module.exports = ListView;


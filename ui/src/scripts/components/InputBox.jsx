var React = require('react');

var InputBox = React.createClass({

  getInitialState: function() {
    return {
      value: ''
    };
  },

  handleKeyDown: function(evt) {
    /*
     * press Enter than trigger Action create
     */
    if (evt.key === "Enter"  )
      this.setState({ value: '' });
  },

  handleChange: function(evt) {
    this.setState({ value: evt.target.value });
  },

  render: function(){
    return (
    <div>
      <input type="text" placeholder="Input todo"
      value={this.state.value}
      onKeyDown={this.handleKeyDown}
      onChange={this.handleChange} />
    </div>
    );
  }
});

module.exports = InputBox;
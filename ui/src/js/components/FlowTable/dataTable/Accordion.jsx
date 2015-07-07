var React = require('react');

var Accordion = React.createClass({
  handleClick: function(){
    this.props.removeOpenList(this.props.isOpen, this.props.title);
    
    if(this.props.isOpen || this.state.open){
      this.setState({
        open: false,
        style: "section"
      });
    }
    else{
      this.setState({
        open: true,
        style: "section open"
      });
    }
  },
  getInitialState: function(){
     return {
       open: false,
       style: "section"
     }
  },

  render: function() {
    var style = this.props.isOpen? "section open" : this.state.style;

    return (
      <div className="accordion">
        <div className={style}>
          <button>toggle</button>
          <div className="sectionhead" onClick={this.handleClick}>{this.props.title}</div>
          <div className="articlewrap">
            <div className="article">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Accordion;
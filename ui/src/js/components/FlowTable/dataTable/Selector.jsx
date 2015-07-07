var React = require('react');
var _ = require('underscore');
var cx = React.addons.classSet;

var Selector = React.createClass({
	getDefaultProps: function() {
		return {
			"columns": [],
			"value": "",
			"placeholder": 'Select Filed',
			"clearValueText": 'Clear value',
			"noResultsText": 'No results found'
		};
	},
	getInitialState: function() {
		return {
			isFocused: false,
			isOpen: false,
			inputValue: '',
			results: null,
			focusedOption: null,
			
		};
	},
	componentWillMount: function() {
		var initResults = this.resetResults();
		this.setState({
			results: initResults,
			focusedOption: initResults? initResults[0] : null
		});

		this._closeMenuIfClickedOutside = function(event) {
			if (!this.state.isOpen) {
				return;
			}
			var menuElem = this.refs.selectMenuContainer.getDOMNode();	// menu div box
			var controlElem = this.refs.control.getDOMNode();	// input div box

			var eventOccuredOutsideMenu = this.clickedOutsideElement(menuElem, event);
			var eventOccuredOutsideControl = this.clickedOutsideElement(controlElem, event);

			// Hide dropdown menu if click occurred outside of menu
			if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
				this.setState({
					isOpen: false
				}, this._unbindCloseMenuIfClickedOutside);
			}
		}.bind(this);

		this._bindCloseMenuIfClickedOutside = function() {
			document.addEventListener('click', this._closeMenuIfClickedOutside);
		};

		this._unbindCloseMenuIfClickedOutside = function() {
			document.removeEventListener('click', this._closeMenuIfClickedOutside);
		};
	},
	componentWillUnmount: function() {
		if(this.state.isOpen) {
			this._unbindCloseMenuIfClickedOutside();
		}
	},
	componentDidUpdate: function() {

		if (this._focusedOptionReveal) {
			if (this.refs.focused && this.refs.menu) {
				var focusedDOM = this.refs.focused.getDOMNode();
				var menuDOM = this.refs.menu.getDOMNode();
				var focusedRect = focusedDOM.getBoundingClientRect();
				var menuRect = menuDOM.getBoundingClientRect();

				//focusedRect.top --> window's top
				//focusedRect.bottom --> window's bottom
				//focusedDOM.offsetTop --> the 'top' value between parent and DOM 
				// focusedDOM.clientHeight// the DOM's height
				
				if (focusedRect.bottom > menuRect.bottom ||
					focusedRect.top < menuRect.top) {
					menuDOM.scrollTop = (focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight);	//the pixels after you scroll
				}
			}

			this._focusedOptionReveal = false;
		}
	},
	clickedOutsideElement: function(element, event) {
		var eventTarget = (event.target) ? event.target : event.srcElement;
	
		while (eventTarget != null) {
			if (eventTarget === element) return false;
			eventTarget = eventTarget.offsetParent;
		}
		return true;
	},
	resetResults: function(){
		var initResults = _.map(this.props.columns, function(item){
			return {
				value: item,
				fuzzyIndex:[]
			};
		});
		return initResults;
	},
	handleMouseDown: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.setState({
			isOpen: true,
		},this._bindCloseMenuIfClickedOutside);
		
		this.refs.input.getDOMNode().focus();
	},
	handleKeyDown: function(event){
		switch(event.keyCode) {
			case 13: //enter
				if(this.state.focusedOption){
					this.setValue(this.state.focusedOption);
				}
				break;

			case 27: // escape
				if (this.state.isOpen) {
					this.resetValue();
				}
				break;
			case 38: //up
				this.focusAdjacentOption('previous');
				break;

			case 40: //down
				this.focusAdjacentOption('next');
				break;

			default:
				return;
		}

		event.preventDefault();
	},
	handleInputChange: function(event) {
		var that = this,
        updatedState = {
            isOpen: true,
            inputValue: event.target.value,
            results: [],
            focusedOption: null
        };

        //do fuzzy search
        var search = event.target.value;
		_.filter(this.props.columns, function(item) {
            var pos = -1;
            var index = [];
			// consider each search character one at a time
			for(var i = 0; i < search.length; i++) {
				var l = search[i];
				if(l == ' ') continue;	// ignore spaces
				
				pos = item.indexOf(l, pos+1);	// search for character & update position
				index.push(pos);
				if(pos == -1) return false;
			}
			updatedState.results.push({
				value: item,
				fuzzyIndex: index
			})
			return true;
        });

        updatedState.focusedOption = updatedState.results? updatedState.results[0] : null;

		this.setState(updatedState, this._bindCloseMenuIfClickedOutside);
	},
	focusAdjacentOption: function(dir) {
		this._focusedOptionReveal = true;

		var results = this.state.results;

		if(!this.state.isOpen){
			
			this.setState({
				isOpen: true,
			},this._bindCloseMenuIfClickedOutside);
			return;
		}

		var focusedIndex = -1;

		for (var i = 0; i < results.length; i++) {
			if (this.state.focusedOption === results[i]) {
				focusedIndex = i;
				break;
			}
		}

		var focusedOption = results[0];

		if (dir === 'next' && focusedIndex > -1 && focusedIndex < results.length - 1) {
			focusedOption = results[focusedIndex + 1];
		} else if (dir === 'previous') {
			if (focusedIndex > 0) {
				focusedOption = results[focusedIndex - 1];
			} else {
				focusedOption = results[results.length - 1];
			}
		}

		this.setState({
			focusedOption: focusedOption
		});
	},
	resetValue: function(){
		var initResults = this.resetResults();
		this.setState({
			isFocused: false,
			isOpen: false,
			inputValue: '',
			results: initResults,
			focusedOption: initResults? initResults[0] : null
		});
		this.refs.input.getDOMNode().value = '';
	},
	focusOption: function(op) {
		this.setState({
			focusedOption: op
		});
	},
	unfocusOption: function(op) {
		if (this.state.focusedOption === op) {
			this.setState({
				focusedOption: null
			});
		}
	},
	focusCheckBox: function(val) {
		this.props.focusCheckBox(val);
	},
	setValue: function(op){

		this._unbindCloseMenuIfClickedOutside();
		var initResults = this.resetResults();
		this.setState({
            isOpen: false,
            focusedOption: op,
            inputValue: op.value,
            results: initResults
        });

        this.refs.input.getDOMNode().value = op.value;
        this.focusCheckBox(op.value);
	},
	buildMenu: function(event){
		var that = this;
		var results = this.state.results;

		var focusedValue = this.state.focusedOption ? this.state.focusedOption.value : null;

		if(results.length > 0) {
			focusedValue = focusedValue == null ? results[0].value : focusedValue;
		}
		
		var options = _.map(results, function(op) {
			var isFocused = focusedValue === op.value;	// check which value needs focused
			var optionClass = cx({
				'Select-option': true,
				'is-focused': isFocused
			});

			var ref = isFocused ? 'focused' : null;
			var value = op.value;
			var node = [];

			for(var i = 0; i < value.length; ++i){
				if( op.fuzzyIndex.length > 0 && _.contains(op.fuzzyIndex, i) ){
					node.push(
						<span className='Select-highlight'>
							{value[i]}
						</span>
					);
				}
				else{
					node.push(value[i]);
				}
			}
			var mouserEnter = that.focusOption.bind(null, op);
			var mouserLeave = that.unfocusOption.bind(null, op);
			var mouseDown = that.setValue.bind(null, op);

			return (
				<div ref={ref} key={'option-' + op.value} className={optionClass} 
					 onMouseEnter={mouserEnter} onMouseLeave={mouserLeave} onMouseDown={mouseDown}>
					{node}
				</div>
			);
			
		});

		var noResult = (
			<div className="Select-noresults">
				{this.props.noResultsText}
			</div>
		);
		return options.length ? options : noResult;
	},
	render: function() {
		var selectClass = cx({
			'Select': true,
			'is-searchable': true,
			'is-open': this.state.isOpen,
			'is-focused': this.state.isFocused,
		});

		var value = [];

		if (!this.state.inputValue && !value.length) {
			value.push(
				<div className="Select-placeholder" key="placeholder">
					{this.props.placeholder}
				</div>
			);
		}

		var	input = (
			<div className="Select-input" style={{"display":"inline-block"}}>
				<input type="text" className="Select-input-text" ref="input" onChange={this.handleInputChange}/> 
			</div>
		);
		
		var menu;
		if (this.state.isOpen) {
			menu = (
				<div ref="selectMenuContainer" className="Select-menu-outer">
					<div ref='menu' className='Select-menu'>{this.buildMenu()}</div>
				</div>
			);
		}

		return (
			<div ref="wrapper" className={selectClass} style={{fontFamily:"Arial"}}>
				<div className="Select-control" ref="control" style={{"height":"40px"}} onMouseDown={this.handleMouseDown} onKeyDown={this.handleKeyDown}>
					{value}
					{input}
					<span className="Select-arrow" />
				</div>
				{menu}
			</div>
		);
	}
});

module.exports = Selector;
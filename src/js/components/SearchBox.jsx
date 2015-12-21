import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/lib/text-field';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.onSearch = this.onSearch.bind(this);
  }

  onSearch(e) {
    console.log("search", e.target.value);
    // e.target.value = '';
  }

  render() {
    return (
      <TextField
        onClick={this.onSearch}
        defaultValue='waynelkh'
        hintText="account"
        onBlur={this.onSearch} />
    );
  }
}

SearchBox.propTypes = {
  PROPS_NAME: PropTypes.string,
};

export default SearchBox;

import React, { PropTypes } from 'react'
import { TableHeaderColumn, TableRow } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import SearchIcon from 'material-ui/svg-icons/action/search';
import ClearIcon from 'material-ui/svg-icons/content/clear';

import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import { blue300 } from 'material-ui/styles/colors';

const iconStyle = {
  color: '#9e9e9e',
  hoverColor: 'black',
}

class FlowtableFilter extends React.PureComponent {
  render() {
    const { showColumn, filters, addFilter, deleteFilter, toggleSearch } = this.props;
    return (
      <TableRow>
       <TableHeaderColumn colSpan={showColumn.length} style={{ position: 'inherit', paddingTop: '10px' }}>
         <IconButton><SearchIcon {...iconStyle} /></IconButton>
         <AutoComplete
           style={{ width: '20%', margin: 5 }}
           ref='searchCategory'
           onNewRequest={(a,b) => this.refs.searchOperator.focus()}
           hintText="Category"
           filter={AutoComplete.fuzzyFilter}
           dataSource={showColumn}
           maxSearchResults={5}
         />
         <AutoComplete
           style={{ width: '20%', margin: 5 }}
           ref='searchOperator'
           onNewRequest={(a,b) => this.refs.searchValue.focus()}
           hintText="Operator"
           filter={AutoComplete.fuzzyFilter}
           dataSource={['==', '!=', '>', '<', 'contains', '!contains']}
           maxSearchResults={5}
         />
         <TextField
           style={{ width: '20%', margin: 5 }}
           ref='searchValue'
           onKeyDown={(e) => {
            if (e.keyCode === 13) {
              const filter = {
                category: this.refs.searchCategory.state.searchText,
                operator: this.refs.searchOperator.state.searchText,
                value: this.refs.searchValue.getValue(),
              }
              if (filter.category == '' || filter.operator == '' || filter.value == '')
                return;
              console.info('Add filter: ', filter);

              this.refs.searchCategory.setState({ searchText: '' });
              this.refs.searchOperator.setState({ searchText: '' });
              this.refs.searchValue.getInputNode().value = '';
              addFilter(filter);
              this.refs.searchValue.focus()
            }
            else if (e.keyCode == 27) {
              console.info('Press Esc');
              toggleSearch();
            }
           }}
           hintText="Value"
         />
         <IconButton onClick={toggleSearch}>
           <ClearIcon {...iconStyle} />
         </IconButton>
         <div style={{ display: 'flex', flexWrap: 'wrap' }}>
           {filters.map( (f, i) =>
           <Chip key={`chip-${i}`} backgroundColor={blue300} onRequestDelete={(e) => deleteFilter(f)} style={{ margin: 4 }}>
             {`${f.category} ${f.operator} ${f.value}`}
           </Chip>)}
         </div>
       </TableHeaderColumn>
      </TableRow>
    );
  }
}

FlowtableFilter.propTypes = {
  showColumn: PropTypes.array.isRequired,
  filters: PropTypes.array.isRequired,
  addFilter: PropTypes.func.isRequired,
  deleteFilter: PropTypes.func.isRequired,
  toggleSearch: PropTypes.func.isRequired,
};

export default FlowtableFilter;

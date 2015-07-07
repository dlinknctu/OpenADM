var React = require("react");
var Table = require('./Table.jsx');
var TablePagination = require('./TablePagination.jsx');
var TableFilter = require('./TableFilter.jsx');
var TableSettings = require('./TableSettings.jsx');
var mui = require('material-ui');
var Dialog = mui.Dialog;
var FlatButton = mui.FlatButton;
var _ = require("underscore");
var OpenFlow10_Fields = require('../../../constants/ofp10-col-selector.json');
var OpenFlow13_Fields = require('../../../constants/ofp13-col-selector.json');

var DataTable = React.createClass({
	getDefaultProps: function(){
		return{
            "columns": [],
            "columnMetadata": [],
            "resultsPerPage":5,
            "results": [], // Used if all results are already loaded.
            "tableClassName":"",
            "settingsText": "Settings",
            "nextText": "Next",
            "previousText": "Previous",
            "showFilter": false,
            "showSettings": false,
            "showAddFlow": true,
            "noDataMessage":"There is no data to display.",
            "showTableHeading":true,
            "showPager":true,
            "useFixedHeader":false,
            "enableInfiniteScroll": false,
            "bodyHeight": null,
            "infiniteScrollSpacerHeight": 50,
            "useFixedLayout": true,
            /* css class names */
            "sortAscendingClassName": "sort-ascending",
            "sortDescendingClassName": "sort-descending",
            "settingsToggleClassName": "settings",
            "openFlowVersion": 1.0
        };
	},
	getCurrentResults: function(){
        //if we have filter return filteredResults else return all results
		return this.state.filteredResults || this.props.results;
	},
	getMetadataColumns: function(){
		// get the columns which is unvisible
        var meta = _.map(_.where(this.props.columnMetadata, {visible: false}), function(item){ return item.columnName});

        return meta;
    },
	getColumns: function(){
        var that = this;
        var results = this.getCurrentResults();

        //if we don't have any data don't mess with this
        if (results === undefined || results.length === 0){ return [];}

        var columns = this.state.filteredColumns;
        var meta = this.getMetadataColumns(); 

        //if we didn't set default or filter
        if (columns.length === 0){
            columns =  _.keys(_.omit(results[0], meta)); //remove meta columns
        }

        columns = _.difference(columns, meta); 

        columns = _.sortBy(columns, function(item){
            var metaItem = _.findWhere(that.props.columnMetadata, {columnName: item});

            if (typeof metaItem === 'undefined' || metaItem === null || isNaN(metaItem.order)){
                return 100;
            }

            return metaItem.order;
        });

        return columns;
    },
    setFilter: function(filter) {
        var that = this,
        updatedState = {
            page: 0,
            filter: filter
        };
       
        // Obtain the state results.
       updatedState.filteredResults = _.filter(this.props.results, function(item) {

            var arr = _.values(item);
            for(var i = 0; i < arr.length; i++){
               var value = "";
               if(arr[i]){
                   value = arr[i].toString().toLowerCase();
                   if (value.indexOf(filter.toLowerCase()) >= 0)
                       return true;
               }
            }

            return false;
        });

        // Update the max page.
        updatedState.maxPage = that.getMaxPage(updatedState.filteredResults);

        //if filter is null or undefined reset the filter.
        if (_.isUndefined(filter) || _.isNull(filter) || _.isEmpty(filter)){
            updatedState.filter = filter;
            updatedState.filteredResults = null;
        }

        // Set the state.
        that.setState(updatedState);
    },
    getFilter: function(){
        if(this.props.showFilter) {
            return (
                <TableFilter changeFilter={this.setFilter} />
            );
        }
        else
            return "";
     
    },
    columnChooserClose: function(){
        this.setState({
            showColumnChooser: false
        });

    },
    toggleColumnChooser: function(){
        this.setState({
            showColumnChooser: true
        });
        this.refs.tableSettingsDialog.show();
    },
    getSettings: function(){
        if(this.props.showSettings){
            return (
                <FlatButton className={this.props.settingsToggleClassName}
                            label={this.props.settingsText}
                            style={{"fontWeight":"bold",fontFamily: "Arial"}}
                            onTouchTap={this.toggleColumnChooser}/>
            );
        }
        else
            return  "";
    },
    setPageSize: function(size){
        this.props.resultsPerPage = size;
        this.setMaxPage();
    },
    setColumns: function(columns){
        
        columns = _.isArray(columns) ? columns : [columns];
        this.props.refreshLocalStorage(columns);
        this.setState({
            filteredColumns: columns
        });
    },
    getColumnSelectorSection: function(keys, cols){
        if(this.state.showColumnChooser){
            return (
                <TableSettings openFlowVersion={this.props.openFlowVersion}
                               columns={keys}
                               selectedColumns={cols}
                               setColumns={this.setColumns}
                               setPageSize={this.setPageSize}
                               resultsPerPage={this.props.resultsPerPage}
                               columnMetadata={this.props.columnMetadata}/>
            );
        }
        else
            return  "";
    },
    getTopSection: function(filter, settings, columnSelector){
        if (this.props.showFilter === false && this.props.showSettings === false){
            return "";
        }

        var topContainerStyles = {
            clear: "both",
            display: "table",
            width: "100%"
        };

        var filterStyles = {
            "float": "left",
            width: "50%",
            textAlign: "left",
            color: "#222",
            minHeight: "1px"
        };

        var settingsStyles = {
            "float": "left",
            width: "50%",
            textAlign: "right"
        };

        var standardActions = [
          { text: 'Close'}
        ];

       return (
            <div className={"top-section"} style={topContainerStyles}>
                <div className={"dataTable-filter"} style={filterStyles}>
                    {filter}
                </div>
                <div className={"dataTable-settings"} style={settingsStyles}>
                    {settings}
                </div>
                <Dialog ref="tableSettingsDialog"
                        title={this.props.settingsText}
                        actions={standardActions}
                        onDismiss={this.columnChooserClose} 
                        style={{"overflow": "scroll"}}
                        contentInnerStyle={{maxWidth:"1500px", width:"1300px"}}
                        contentStyle={{maxWidth:"1500px", width:"1350px"}}>
                    {columnSelector}
                </Dialog>
            </div>
        );
    },
    getDataForRender: function(data, cols, pageList){
    	var that = this;
        //get the correct page size
        if(this.state.sortColumn !== "")
        {
            data = _.sortBy(data, function(item){
                return item[that.state.sortColumn];
            });

            if(this.state.sortAscending === false){
                data.reverse();
            }
        }

        var currentPage = this.getCurrentPage();

        if (pageList && (this.props.resultsPerPage * (currentPage+1) <= this.props.resultsPerPage * this.state.maxPage) && (currentPage >= 0))
        {
            if (this.props.enableInfiniteScroll) {
              // If we're doing infinite scroll, grab all results up to the current page.
              var maxPage = this.getMaxPage();
              data = _.first(data, maxPage * this.props.resultsPerPage);
            } else {
              //the 'rest' is grabbing the whole array from index on and the 'initial' is getting the first n results
              var rest = _.rest(data, currentPage * this.props.resultsPerPage);
              data = _.initial(rest, rest.length-this.props.resultsPerPage);
            }
        }

        var transformedData = [];

        for(var i = 0; i < data.length; i++)
        {
            var mappedData = data[i];
            transformedData.push(mappedData);
        }
        return transformedData;
    },
    getMaxPage: function(results, totalResults){
        if (!totalResults) {
          totalResults = (results||this.getCurrentResults()).length;
        }
        var maxPage = Math.ceil(totalResults / this.props.resultsPerPage);
        return maxPage;
    },
    setMaxPage: function(results){
        var maxPage = this.getMaxPage(results);
        //re-render if we have new max page value
        if (this.state.maxPage !== maxPage){
          this.setState({page: 0, maxPage: maxPage, filteredColumns: this.props.columns });
        }
    },
    setPage: function(number) {
        //check page size and move the filteredResults to pageSize * pageNumber
        if (number * this.props.resultsPerPage <= this.props.resultsPerPage * this.state.maxPage) {
            this.setState({page: number});
        }
    },
    getCurrentPage: function(){

        return this.state.page;
    },
    getCurrentMaxPage: function(){
        return this.state.maxPage;
    },
    nextPage: function() {
        var currentPage = this.getCurrentPage();
        if (currentPage < this.getCurrentMaxPage() - 1) { this.setPage(currentPage + 1); }
    },
    previousPage: function() {
      var currentPage = this.getCurrentPage();
      if (currentPage > 0) { this.setPage(currentPage - 1); }
    },
    changeSort: function(sort){
        var that = this;
        var state = {
            page:0,     //back to first page
            sortColumn: sort,   //the selected column  
            sortAscending: true
        };

        // If this is the same column, reverse the sort.
        if(this.state.sortColumn == sort){
            state.sortAscending = !this.state.sortAscending;
        }

        this.setState(state);
    },
    getPagingSection: function(currentPage, maxPage){
    	//infiniteScroll does not need pager
        if ((this.props.showPager && !this.props.enableInfiniteScroll) === false) {
            return "";
        }
        
        return (
        	<div className={"dataTable-footer"}>
        		<TablePagination next={this.nextPage}
        						 previous={this.previousPage}
        						 currentPage={currentPage}
        						 maxPage={maxPage}
        						 setPage={this.setPage}
        						 nextText={this.props.nextText}
        						 previousText={this.props.previousText}

        		/>
        	</div>
        );
    },
    componentWillReceiveProps: function(nextProps) {
        this.setMaxPage(nextProps.results);
    },
    getInitialState: function() {
        var state =  {
            maxPage: 0,
            page: 0,    //now page
            filteredResults: null,
            filteredColumns: [],
            filter: "",
            sortColumn: "",
            sortAscending: true,
            showColumnChooser: false
        };

        return state;
    },
    componentWillMount: function() {
        this.setMaxPage();
		this.setState({
			filteredColumns: this.props.columns
		});
    },
	getContentSection: function(data, cols, pagingContent, hasMorePages){
		return (
			<div>
				<Table useFixedLayout={this.props.useFixedLayout}
					   columnMetadata={this.props.columnMetadata}
					   showPager={this.props.showPager}
					   pagingContent={pagingContent}
					   data={data}
					   columns={cols}
					   className={this.props.tableClassName}
					   enableInfiniteScroll={this.props.enableInfiniteScroll}
					   nextPage={this.nextPage}
					   changeSort={this.changeSort}
					   sortColumn={this.state.sortColumn}
					   sortAscending={this.state.sortAscending}
					   useFixedHeader={this.props.useFixedHeader}
					   sortAscendingClassName={this.props.sortAscendingClassName}
					   sortDescendingClassName={this.props.sortDescendingClassName}
					   bodyHeight={this.props.bodyHeight}
					   infiniteScrollSpacerHeight={this.props.infiniteScrollSpacerHeight}
					   hasMorePages={hasMorePages}
				/>
			</div>
		);
	},
    isNoDataResults: function(results) {
        if((typeof results === "undefined") || (results.length === 0))
            return true;
        else
            return false; 
    },
    getNoDataSection: function(topSection){
        return (
            <div>
                {topSection}
                {this.props.noDataMessage}
            </div>
        );
    },
    
	render: function(){
		var that = this;
		var results = this.getCurrentResults(); // Attempt to assign to the filtered results, if we have any.

		var keys = [];
        var visibleCols = this.getColumns();

        //figure out which columns are displayed and show only those
        var data = this.getDataForRender(results, visibleCols, true);  

        //figure out if we want to show the filter section
        var filter = this.getFilter();
        var settings = this.getSettings();
       
        
        // Grab the column keys from the first results
        if(this.props.openFlowVersion === 1.0){
            keys = OpenFlow10_Fields;
        }
        else if(this.props.openFlowVersion === 1.3){
            keys = OpenFlow13_Fields;
        }
        var columnSelector = this.getColumnSelectorSection(keys, visibleCols);
        var topSection = this.getTopSection(filter, settings, columnSelector);

        // Grab the current and max page values.
        var currentPage = this.getCurrentPage();
        var maxPage = this.getCurrentMaxPage();
        // Determine if we need to enable infinite scrolling on the table.
        var hasMorePages = (currentPage + 1) < maxPage;

        
        // Grab the paging content if it's to be displayed
        var pagingContent = this.getPagingSection(currentPage, maxPage);
		var resultContent = this.getContentSection(data, visibleCols, pagingContent, hasMorePages);

        if(this.isNoDataResults(results)){
            return this.getNoDataSection(topSection);
        }
        
        var dataTableStyle = {
            "font-family": "Arial, Helvetica, sans-serif",
            "margin-bottom": "20px"
        }
		return (
			<div className={dataTableStyle}>
                {topSection}
				<div className={"dataTable-container"} style={{border: "1px solid #DDD"}}>
					{resultContent}
				</div>
			</div>
		);
	}
});

module.exports = DataTable;
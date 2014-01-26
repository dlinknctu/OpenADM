var margin = {top: 30, right: 50, bottom: 50, left: 150},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var yscale = 1000000;
var yscaletext = "MB/intvl.";

var parseDate = d3.time.format("%Y-%m-%d %H:%M").parse;

var x = d3.time.scale()
  .range([0, width]);

var y = d3.scale.linear()
  .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

var line = d3.svg.line()
  .interpolate("basis")
  .x(function(d) { return x(d.Time); })
  .y(function(d) { return y(d.Byte/yscale); });

var svg = d3.select("body").append("svg")
	  .attr("width", width + margin.left + margin.right)
	  .attr("height", height + margin.top + margin.bottom)
  .append("g")
	  .attr("id", "transform")
	  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function svgclear(){
	$("#transform").empty();
}

function svgplot(resp){
		data = d3.tsv.parse(resp);
	  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Time"; }));

	  // if there is no result returned
	  if(data.length == 0) {
			alert("No result found.");
			return;
	  }

	  data.forEach(function(d) {
	    d.Time = parseDate(d.Time);
	  });

	  var cities = color.domain().map(function(name) {
	    return {
	      name: name,
	      values: data.map(function(d) {
	        return {Time: d.Time, Byte: +d[name]};
	      })
	    };
	  });

	  x.domain(d3.extent(data, function(d) { return d.Time; }));

	  y.domain([
	    d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.Byte/yscale; }); }),
	    d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.Byte/yscale; }); })
	  ]);

	  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
    	.append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Traffic (" + yscaletext + ")");

	  var city = svg.selectAll(".city")
      .data(cities)
	    .enter().append("g")
      .attr("class", "city");

	  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });

	  city.append("text")
	    .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
	    .attr("transform", function(d) { return "translate(" + x(d.value.Time) + "," + y(d.value.Byte/yscale) + ")"; })
	    .attr("x", 3)
	    .attr("dy", ".35em")
	    .text(function(d) { return d.name; });
}
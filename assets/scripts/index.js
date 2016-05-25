'use strict';

// set size attributes of chart
let margin = {top: 50, right: 50, bottom: 30, left: 50},
    width = 1200 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// declare tooltip div and append it to the html
let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// declare area svg
let area = d3.svg.area()
    .interpolate("basis")
    .x(function(d) { return x(d.season_num); })
    .y0(height)
    .y1(function(d) { return y(d.number_episodes); });

// define x and y scale
let x = d3.scale.linear()
    .range([0, width]);

let y = d3.scale.linear()
    .range([height, 0]);

// define color array
let color = d3.scale.category10();

// set up x and y axis
let xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

let yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// declare svg line (with interpolation)
let line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.season_num); })
    .y(function(d) { return y(d.number_episodes); });

// declare the svg
let svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// read in the csv data and build the chart
d3.csv("assets/data/bob-ross-by-season.csv", function(error, data) {
  console.log(data);
  if (error) throw error;

  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "season_num"; }));

  let objects = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {season_num: d.season_num, number_episodes: +d[name]};
      })
    };
  });

  // set range of x and y axis
  x.domain([0,31]);
  y.domain([0,14]);

  // append x-axis SVG to chart
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .style("fill", "white")
      .append("text")
        .attr("y", 20)
        .attr("x", 30)
        .style("text-anchor", "beginning")
        .style("fill", "white")
        .text("Season");

  // append y-axis SVG to chart
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .style("fill", "white")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("fill", "white")
      .text("Number of episodes thing is mentioned");

  // define object variable to hold data
  let object = svg.selectAll(".object")
      .data(objects)
    .enter().append("g")
      .attr("class", "object");

  // append line svg to object array
  object.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); })
      .on('mouseover', function(e) {
        // show tooltip on mouseover
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div.html(function(f) {
            let label = '';
            for (let i = 0; i < e.name.length; i++) {
              if (e.name[i] === '_') {
                label += ' ';
              } else {
              label += e.name[i];
              }
            }
            return label;
        })
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

            // make the line you're mousing over more opaque
            d3.select(this).transition().duration(200)
            .style("opacity", .9);

      }).on("mouseout", function(d) {
        // revert opacity back to .4
        d3.select(this).transition().duration(500)
          .style("opacity", .4);

        }).on("click", function(d) {
          // on click of line, append area svg under line
          object.append("path")
            .attr("class", "area")
            .attr("d", function() { return area(d.values); })
            .style("fill", function() { return color(d.name); })
            .style("opacity", 0.5)
            .on("dblclick", function(d) {
              // dblclick to clear area paths
              console.log("click");
              d3.selectAll(".area").remove();
            });

        });

});

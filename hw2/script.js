/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it (highly recommended!)

function staircase() {
    /* get bar */
    var barChart = document.getElementById("firstBarChart").getElementsByTagName("rect");
    /* get elements */
    var barElements = [].slice.call(barChart);
    /* get heights */
    var heightElements = [];
    for(var i = 0; i < barElements.length; i++){
        heightElements[i] = barElements[i].getAttribute("height");
    }
    /* sort array */
    heightElements = heightElements.sort(function (a, b) { 
        return a - b; /* sort numerically */
    });
    for(var i = 0; i < barElements.length; i++){
        barChart[i].setAttribute("height", heightElements[i]);
    }
}

function update(error, data) {
    if (error !== null) {
        alert("Couldn't load the dataset!");
    } else {
        // D3 loads all CSV data as strings;
        // while Javascript is pretty smart
        // about interpreting strings as
        // numbers when you do things like
        // multiplication, it will still
        // treat them as strings where it makes
        // sense (e.g. adding strings will
        // concatenate them, not add the values
        // together, or comparing strings
        // will do string comparison, not
        // numeric comparison).

        // We need to explicitly convert values
        // to numbers so that comparisons work
        // when we call d3.max()
        data.forEach(function (d) {
            d.a = parseInt(d.a);
            d.b = parseFloat(d.b);
        });
    }

    // Set up the scales
    var aScale = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.a;
        })])
        .range([0, 140]);
    var bScale = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.b;
        })])
        .range([0, 93]);
    var iScale = d3.scale.linear()
        .domain([0, data.length])
        .range([0, 220]);

    // ****** TODO: PART III (you will also edit in PART V) ******

    /* BAR CHARTS */
    /* first chart */
    /* selecting existing structure */
    var barChart = d3.select("#firstBarChart").select("g") /* select the pre defined group */
        .selectAll("rect") /* select all rects */ 
        .data(data); /* joins the data */
    
    /* creating the bars */
    barChart.enter() /* gets the enter selection */
        .append("rect") /* appends a new element for every data item */
        .attr("y", 0) /* set the y attribute */
        .attr("x", function(d, i){ /* set the x attribute */
            return i * 20;
        }) 
        .attr("width", 20) /* set the width attribute */
        .attr("height", 0); /* set the height for transition purposes */

    /* mouse actions */
    barChart.on("mouseover", function(){ /* set on mouse over attribute */
            d3.select(this) /* select the bar which mouse rests on */
                .transition() /* create animated transition */
                .duration(30) /* set the duration of the transition */
                .style("fill", "#f7ac84");
        })
        .on("mouseout", function () { /* set on mouse out attribute */
            d3.select(this) /* select the bar which mouse rests on */
                .transition() /* create animated transition */
                .duration(50) /* set the duration of the transition */
                .style("fill", "#f27938");
        });

    /* removing old elements */
    barChart.exit() /* get the exit selection */
        .transition() /* create animated transition */
        .duration(1000) /* set the duration of the transition */
        .delay(function(d, i) { /* delay function to create cascade style */
            return i * 100;
        })
        .attr("height", 0) /*set height to zero on transition */
        .remove();

    /* updating remaining elements */
    barChart.transition() /* create animated transition */
        .duration(1000) /* set the duration of the transition */
        .delay(function(d, i) { /* delay function to create cascade style */
            return i * 100;
        })
        .attr("height", function(d){ /* update the the height attribute */
            return aScale(d.a);
        });

    /* second chart */
    /* selecting existing structure */
    var barChart = d3.select("#secondBarChart").select("g") /* select the pre defined group */
        .selectAll("rect") /* select all rects */ 
        .data(data); /* joins the data */
    
    /* creating the bars */
    barChart.enter() /* gets the enter selection */
        .append("rect") /* appends a new element for every data item */
        .attr("y", 0) /* set the y attribute */
        .attr("x", function(d, i){ /* set the x attribute */
            return i * 20;
        }) 
        .attr("width", 20) /* set the width attribute */
        .attr("height", 0); /* set the height for transition purposes */

    /* mouse actions */
    barChart.on("mouseover", function(){ /* set on mouse over attribute */
            d3.select(this) /* select the bar which mouse rests on */
                .transition() /* create animated transition */
                .duration(30) /* set the duration of the transition */
                .style("fill", "#f7ac84");
        })
        .on("mouseout", function () { /* set on mouse out attribute */
            d3.select(this) /* select the bar which mouse rests on */
                .transition() /* create animated transition */
                .duration(50) /* set the duration of the transition */
                .style("fill", "#f27938");
        });

    /* removing old elements */
    barChart.exit() /* get the exit selection */
        .transition() /* create animated transition */
        .duration(1000) /* set the duration of the transition */
        .delay(function(d, i) { /* delay function to create cascade style */
            return i * 100;
        })
        .attr("height", 0) /*set height to zero on transition */
        .remove();

    /* updating remaining elements */
    barChart.transition() /* create animated transition */
        .duration(1000) /* set the duration of the transition */
        .delay(function(d, i) { /* delay function to create cascade style */
            return i * 100;
        })
        .attr("height", function(d){ /* update the the height attribute */
            return aScale(d.b);
        });

    /* LINE CHARTS */
    /* first chart */ 
    /* line generator */
    var aLineGenerator = d3.svg.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });

    /* selecting existing structure */
    var lineChart = d3.select("#firstLineChart").select("g") /* select the pre defined group */
        .select("path"); /* select the path */

    /* update the line path */
    lineChart.transition() /* create animated transition */
        .duration(2000) /* set the duration of the transition */
        .attr("d", aLineGenerator(data));

    /* second chart */
    /* line generator */
    var bLineGenerator = d3.svg.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return bScale(d.b);
        });

    /* selecting existing structure */
    lineChart = d3.select("#secondLineChart").select("g") /* select the pre defined group */
        .select("path");

    /* update the line path */
    lineChart.transition() /* create animated transition */
        .duration(2000) /* set the duration of the transition */
        .attr("d", bLineGenerator(data));

    /* AREA CHARTS */
    /* first chart */
    /* area generator */
    var aAreaGenerator = d3.svg.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.a);
        });

    /* selecting existing structure */
    var areaChart = d3.select("#firstAreaChart").select("g") /* select the pre defined group */
        .select("path");

    /* updating the area path */
    areaChart.transition() /* create animated transition */
        .duration(2000) /* set the duration of the transition */
        .attr("d", aAreaGenerator(data));

    /* second chart */
    /* area generator */
    var bAreaGenerator = d3.svg.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.b);
        });

    /* selecting existing structure */
    areaChart = d3.select("#secondAreaChart").select("g") /* select the pre defined group */
        .select("path");

    /* updating the area path */
    areaChart.transition() /* create animated transition */
        .duration(2000) /* set the duration of the transition */
        .attr("d", bAreaGenerator(data));

    /* SCATTERPLOT */
    /* selecting existing structure */
    var scatterplot = d3.select("#scatterplot").select("g") /* select the pre defined group */
        .selectAll("circle") /* select all rects */ 
        .data(data); /* joins the data */

    /* get tooltip div */
    var tooltip = d3.select("#tooltip");

    /* creating the circles */
    scatterplot.enter() /* gets the enter selection */
        .append("circle") /* appends a new element for every data item */
        .on("click", function(d, i){  /* set on mouse click attribute */
            console.log("Coordinate #" + i + ": (" + d.a + ", " + d.b + ")");
        })
        .on("mouseover", function(d){ /* set on mouse over attribute */
            tooltip.transition()
                .duration(250)
                .style("opacity", 1)
            tooltip.html("(" + d.a + ", " + d.b + ")")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 20) + "px");
        })
        .on("mouseout", function(){ /* set on mouse out attribute */
            tooltip.transition()
                .style("opacity", 0); 
        })
        .attr("cy", -5) /* set the cx attribute - start at the bottom for cool transition */
        .attr("cx", function (d, i) { /* set the cx attribute */
            return d.a * 10;
        })
        .attr("r", 0); /* set the radius attribute - start at zero for cool transitions*/

    /* removing old elements */
    scatterplot.exit() /* get the exit selection */
        .transition() /* create animated transition */
        .duration(1000) /* set the duration of the transition */
        .delay(function(d, i) { /* delay function to create cascade style */
            return i * (100 + (10 * i));
        })
        .attr("r", 0) /*set height to zero on transition */
        .remove();

    /* updating remaining elements */
    scatterplot.transition() /* create animated transition */
        .duration(1000) /* set the duration of the transition */
        .delay(function(d, i) { /* delay function to create cascade style */
            return i * 100;
        })
        .attr("cx", function (d, i) { /* set the cx attribute */
            return d.a * 10;
        })
        .attr("cy", function (d, i) { /* set the cy attribute */
            return d.b * 10;
        })
        .attr("r", 5); /* set the radius attribute */
    // ****** TODO: PART IV ******
}

function changeData() {
    // Load the file indicated by the select menu
    var dataFile = document.getElementById('dataset').value;
    d3.csv('data/' + dataFile + '.csv', update);
}

function randomSubset() {
    // Load the file indicated by the select menu,
    // and then slice out a random chunk before
    // passing the data to update()
    var dataFile = document.getElementById('dataset').value;
    d3.csv('data/' + dataFile + '.csv', function (error, data) {
        var subset = [];
        data.forEach(function (d) {
            if (Math.random() > 0.5) {
                subset.push(d);
            }
        });

        update(error, subset);
    });
}
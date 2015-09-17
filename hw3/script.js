/*globals d3, topojson, document*/
// These are helpers for those using JSHint

var data,
    locationData,
    teamSchedules,
    selectedSeries,
    colorScale;

/* EVENT RESPONSE FUNCTIONS */
function setHover(d) {
    if(d == null) d3.select("#info").html("");
    else if(d["data_type"] == "Game") d3.select("#info").html("<h2>" + d["Visit Team Name"] + " @ " + d["Home Team Name"] + "</h2>");
    else if(d["data_type"] == "Team") d3.select("#info").html("<h2>" + d["name"] + "</h2>");
    else{
        var info = ""
        for(gameNum = 0; gameNum < d.value["games"].length; gameNum++){
            var game = d.value["games"][gameNum];
            info += game["Visit Team Name"] + " @ " + game["Home Team Name"] + " ";
        }
        d3.select("#info").html("<h2>" + info + "</h2>");
    }
}

function clearHover() {
    setHover(null);
}

function changeSelection(d) {
    if(d == null);
    else if(d["data_type"] == "Game") console.log(d);
    else if(d["data_type"] == "Team") selectedSeries = teamSchedules[d["name"]];
    else{
        var info = ""
        for(gameNum = 0; gameNum < d.value["games"].length; gameNum++){
            var game = d.value["games"][gameNum];
            info += game["Visit Team Name"] + " @ " + game["Home Team Name"] + " ";
        }
        d3.select("#info").html("<h2>" + info + "</h2>");
    }

    // ******* TODO: PART V *******
    
    updateBarChart();

    // Update everything that is data-dependent
    // Note that updateBarChart() needs to come first
    // so that the color scale is set
}

/* DRAWING FUNCTIONS */

function updateBarChart() {
    var svgBounds = document.getElementById("barChart").getBoundingClientRect(),
        xAxisSize = 100,
        yAxisSize = 60;

    /* create stacles */
    var attendanceScale = d3.scale.linear()
        .domain([0, d3.max(selectedSeries, function(d){
            return d["attendance"];
        })])
        .range([0, svgBounds["height"]]);

    /* color scale */
    colorScale = d3.scale.linear()
        .domain([d3.min(selectedSeries, function(d){
            return d["attendance"];
        }), d3.max(selectedSeries, function(d){
            return d["attendance"];
        })])
        .range(["#4eb3d3","#084081"]);

    // /* create axis */
    // var xAxis = d3.svg.axis()
    //     .orient("bottom")
    //     .scale(attendanceScale);

    // var yAxis = d3.svg.axis()
    //     .orient("left")
    //     .scale(attendanceScale);
    
    // /* append axis */
    // d3.select("#yAxis")
    //     .call(yAxis);

    // d3.select("#xAxis")
    //     .call(xAxis);

    /* handle existing structure */
    var bars = d3.select("#bars")
        .selectAll("rect")
        .data(selectedSeries);

    /* initialize bar */
    bars.enter()
        .append("rect")
        .attr("y", 0) 
        .attr("x", function(d, i){
            return i * (svgBounds["width"] / selectedSeries.length);
        }) 
        .attr("width", function(d, i){
            return svgBounds["width"] / (selectedSeries.length + 2);
        })
        .attr("height", 0);

    /* removing old elements */
    bars.exit() /* get the exit selection */
        .transition() /* create animated transition */
        .duration(1500) /* set the duration of the transition */
        .delay(function(d, i) { /* delay function to create cascade style */
            return i * 100;
        })
        .attr("height", 0) /*set height to zero on transition */
        .remove();

    /* updating remaining elements */
    bars.transition()
        .duration(1500)
        .delay(function(d, i){
            return i * 50;
        })
        .attr("height", function(d){
            return attendanceScale(d["attendance"]);
        })
        .attr("fill", function(d){
            return colorScale(d["attendance"]);
        });

    /* mouse actions */
    bars.on("mouseover", function(d){
            setHover(d);
        })
        .on("mouseout", function () {
            clearHover();
        })
        .on("click", function(d){
            changeSelection(d);
        });
}

function updateForceDirectedGraph() {
    var force = d3.layout.force()
        .charge(-100)
        .linkDistance(1)
        .friction(0.9)
        .gravity(0.1)
        .size([400, 400]);

    force
        .nodes(data.vertices)
        .links(data.edges)
        .start();

    var nodes = d3.select("#nodes")
        .selectAll("path")
        .data(data.vertices);

    nodes.enter()
        .append("path")
        .attr("class", function(d){
            if(d["data_type"] == "Team") return "team";
            else return "game";
        })
        .call(force.drag);

    var links = d3.select("#links")
        .selectAll("line")
        .data(data.edges)
        .enter()
        .append("line");

    
    // ******* TODO: PART IV *******
    
    nodes.on("mouseover", function(d){
            setHover(d);
        })
        .on("mouseout", function () {
            clearHover();
        })
        .on("click", function(d){
            changeSelection(d);
        });
    
    // ******* TODO: PART V *******
    
    // ******* TODO: PART II *******
    
    force.on("tick", function () {
        links.attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        nodes.attr("transform", function (d) {
                return "translate(" + d.x + ", " + d.y + ")";
            })
            .attr("d", d3.svg.symbol().type(function(d){
                    if(d["data_type"] == "Team") return "triangle-up";
                })
            );
    });
}

// insights from http://bl.ocks.org/mbostock/4090848
function updateMap() {
    var projection = d3.geo.albersUsa()
        .scale(800)
        .translate([305, 218]);

    var gamesPlayed = d3.select("#points")
        .selectAll("circle")
        .data(d3.entries(locationData));

    gamesPlayed.enter()
        .append("circle")
        .attr("r", function (d){
            return 4;
        })
        .attr("transform", function(d){
            return "translate(" + projection([
                d.value.longitude,
                d.value.latitude
                ]) + ")"
        })
        .style("opacity", 0)
        .classed("game", true);

    gamesPlayed.transition()
        .duration(1500)
        .style("opacity", 1);

    /* mouse actions */
    gamesPlayed.on("mouseover", function(d){
            setHover(d);
        })
        .on("mouseout", function () {
            clearHover();
        })
        .on("click", function(d){
            changeSelection(d);
        });
    
    // NOTE: locationData is *NOT* a Javascript Array, like
    // we'd normally use for .data() ... instead, it's just an
    // object (often called an Associative Array)!
    
    // ******* TODO: PART V *******
    
    // Update the circle appearance (set the fill to the
    // mean attendance of all selected games... if there
    // are no matching games, revert to the circle's default style)
}

function drawStates(usStateData) {
    // code from http://bl.ocks.org/mbostock/2869946
    d3.select("#states")
        .datum(topojson.feature(usStateData, usStateData.objects.states))
        .attr("d", d3.geo.path());
}


/* DATA DERIVATION */

// You won't need to edit any of this code, but you
// definitely WILL need to read through it to
// understand how to do the assignment!

function dateComparator(a, b) {
    // Compare actual dates instead of strings!
    return Date.parse(a.Date) - Date.parse(b.Date);
}

function isObjectInArray(obj, array) {
    // With Javascript primitives (strings, numbers), you
    // can test its presence in an array with
    // array.indexOf(obj) !== -1
    
    // However, with actual objects, we need this
    // helper function:
    var i;
    for (i = 0; i < array.length; i += 1) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

function deriveGraphData() {
    // Currently, each edge points to the "_id" attribute
    // of each node with "_outV" and "_inV" attributes.
    // d3.layout.force expects source and target attributes
    // that point to node index numbers.

    // This little snippet adds "source" and "target"
    // attributes to the edges:
    var indexLookup = {};
    data.vertices.forEach(function (d, i) {
        indexLookup[d._id] = i;
    });
    data.edges.forEach(function (d) {
        d.source = indexLookup[d._outV];
        d.target = indexLookup[d._inV];
    });
}

function deriveLocationData() {
    var key;

    // Obviously, lots of games are played in the same location...
    // ... but we only want one interaction target for each
    // location! In fact, when we select a location, we want to
    // know about ALL games that have been played there - which
    // is a different slice of data than what we were given. So
    // let's reshape it ourselves!

    // We're going to create a hash map, keyed by the
    // concatenated latitude / longitude strings of each game
    locationData = {};

    data.vertices.forEach(function (d) {
        // Only deal with games that have a location
        if (d.data_type === "Game" &&
            d.hasOwnProperty('latitude') &&
            d.hasOwnProperty('longitude')) {

            key = d.latitude + "," + d.longitude;

            // Each data item in our new set will be an object
            // with:

            // latitude and longitude properties,

            // a data_type property, similar to the ones in the
            // original dataset that you can use to identify
            // what type of selection the current selection is,
            
            // and a list of all the original game objects that
            // happened at this location
            
            if (!locationData.hasOwnProperty(key)) {
                locationData[key] = {
                    "latitude": d.latitude,
                    "longitude": d.longitude,
                    "data_type": "Location",
                    "games": []
                };
            }
            locationData[key].games.push(d);
        }
    });

    // Finally, let's sort each list of games by date
    for (key in locationData) {
        if (locationData.hasOwnProperty(key)) {
            locationData[key].games = locationData[key].games.sort(dateComparator);
        }
    }
}

function deriveTeamSchedules() {
    var teamName;

    // We're going to need a hash map, keyed by the
    // Name property of each team, containing a list
    // of all the games that team played, ordered by
    // date
    teamSchedules = {};

    // First pass: I'm going to sneakily iterate over
    // the *edges*... this will let me know which teams
    // are associated with which games
    data.edges.forEach(function (d) {
        // "source" always refers to a game; "target" always refers to a team
        teamName = data.vertices[d.target].name;
        if (!teamSchedules.hasOwnProperty(teamName)) {
            teamSchedules[teamName] = [];
        }
        teamSchedules[teamName].push(data.vertices[d.source]);
    });

    // Now that we've added all the game objects, we still need
    // to sort by date
    for (teamName in teamSchedules) {
        if (teamSchedules.hasOwnProperty(teamName)) {
            teamSchedules[teamName] = teamSchedules[teamName].sort(dateComparator);
        }
    }
}


/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

d3.json("data/us.json", function (error, usStateData) {
    if (error) throw error;
    
    drawStates(usStateData);
});
d3.json("data/pac12_2013.json", function (error, loadedData) {
    if (error) throw error;

    // Store the data in a global variable for all functions to access
    data = loadedData;

    // These functions help us get slices of the data in
    // different shapes
    deriveGraphData();
    deriveLocationData();
    deriveTeamSchedules();
    
    // Start off with Utah's games selected
    selectedSeries = teamSchedules.Utah;

    // Draw everything for the first time
    updateBarChart();
    updateForceDirectedGraph();
    updateMap();
});

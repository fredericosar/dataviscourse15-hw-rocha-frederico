/*globals d3, queue, CountVis, AgeVis, PrioVis*/

/**
 * Created by Alex Bigelow (alex.bigelowsite.com) on 9/25/15.
 */

// This syntax may look weird:

// (function () {
//      // all the code is in here
// })();

// This is called a "closure." In previous assignments,
// we have just executed statements in a global context
// as files were loaded. Closures are similar - stuff inside
// the closure is executed immediately. However, all the
// variables and things we create globally no longer "pollute"
// the global namespace; now they're eligible for garbage
// collection, and global variable names you define here
// won't collide with variable names in other scripts and libraries.

(function () {
    // some variables
    var allData = [];
    var metaData = {};

    // this function can convert Date objects to a string
    // it can also convert strings to Date objects
    // see: https://github.com/mbostock/d3/wiki/Time-Formatting
    var dateFormatter = d3.time.format("%Y-%m-%d");

    // call this function after Data is loaded, reformatted and bound to the variables
    function initVis() {
        
        // ******* TASK 3b, 3c *******
        // Create a handler that will deal with a custom event named "selectionChanged"
        // (you will need to edit this line)
        var eventHandler = d3.dispatch("selectionChanged");

        // Instantiate all Vis Objects here
        var countVis = new CountVis(d3.select("#countVis"), allData, metaData, eventHandler);
        var ageVis = new AgeVis(d3.select("#ageVis"), allData, metaData);
        var prioVis = new PrioVis(d3.select("#prioVis"), allData, metaData, eventHandler, false);

        // ******** TASK 4b *******
        var prioMaxVis = new PrioVis(d3.select("#prioVis"), allData, metaData, eventHandler, true);

        // ******** TASK 3b, 3c *******
        // Bind the eventHandler to the Vis Objects
        // events will be created from the CountVis object (TASK 4b)
        // events will be consumed by the PrioVis and AgeVis object
        // (you should bind the appropriate functions here)
        // Also make sure to display something reasonable about
        // the brush in #brushInfo
        eventHandler.on("selectionChanged", selectionChanged);
        function selectionChanged (start, end) {
            ageVis.onSelectionChange(start, end);
            prioVis.onSelectionChange(start, end);
            // update #brushInfo
            d3.select("#brushInfo").html(start + " ->" + end);   
        }

        // ******** TASK 4b *******
        // Keep track of the show max input
         d3.select("#originalData").on("change", function() {
            prioVis.displayCountChart = d3.select("#originalData").property('checked');
            prioMaxVis.displayCountChart = d3.select("#originalData").property('checked');
            showCountChart();
        });

        function showCountChart(){
            // update prioVis
            prioVis.updateVis();
            // update prioMaxVis
            prioMaxVis.updateVis();
        }
        
    }

    // call this function after both files are loaded -- error should be "null" if no error
    function dataLoaded(error, perDayData, _metaData) {
        if (!error) {
            // make our data look nicer and more useful:
            allData = perDayData.map(function (d) {
                var res = {
                    time: dateFormatter.parse(d.day),
                    count: +d["count(*)"]
                };
                
                res.prios = d3.range(0, 16).map(function (counter) {
                        return d["sum(p" + counter + ")"];
                    });
                res.ages = d3.range(0, 99).map(function () {
                    return 0;
                });
                d.age.forEach(function (a) {
                    if (a.age < 100) {
                        res.ages[a.age] = a["count(*)"];
                    }
                });
                return res;
            });
            metaData = _metaData;

            initVis();
        }
    }

    function startHere() {
        // ******* TASK 1a *******
        // Load each data file ASYNCHRONOUSLY, and then call dataLoaded() when they are finished.
        queue()
            .defer(d3.json, 'data/perDayData.json')
            .defer(d3.json, 'data/MyWorld_fields.json')
            .await(dataLoaded);
        
    }
    
    startHere();
})();

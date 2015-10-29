/*globals VolumeRenderer, d3, console*/

var renderer,
    allHistograms = {};

/* initiate color pickers */
var colorA = new ColorPicker("#colorA");
var colorB = new ColorPicker("#colorB");
var colorC = new ColorPicker("#colorC");
var colorD = new ColorPicker("#colorD");
var colorE = new ColorPicker("#colorE");

/* initiate color boarders */
var colors = [0.0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 1.0];

/* selectors */
d3.select('#sliderA').call(d3.slider().axis(false).value([0, 15]).on("slide", function(evt, value) {
    colors[0] = value[0] / 100;
    colors[1] = value[1] / 100;
    updateTransferFunction();
}));

d3.select('#sliderB').call(d3.slider().axis(false).value([20, 35]).on("slide", function(evt, value) {
    colors[2] = value[0] / 100;
    colors[3] = value[1] / 100;
    updateTransferFunction();
}));

d3.select('#sliderC').call(d3.slider().axis(false).value([40, 55]).on("slide", function(evt, value) {
    colors[4] = value[0] / 100;
    colors[5] = value[1] / 100;
    updateTransferFunction();
}));

d3.select('#sliderD').call(d3.slider().axis(false).value([60, 75]).on("slide", function(evt, value) {
    colors[6] = value[0] / 100;
    colors[7] = value[1] / 100;
    updateTransferFunction();
}));

d3.select('#sliderE').call(d3.slider().axis(false).value([80, 100]).on("slide", function(evt, value) {
    colors[8] = value[0] / 100;
    colors[9] = value[1] / 100;
    updateTransferFunction();
}));

function getRBGA(color, opacity){
    return "rgba(" + color.r + "," + color.g + "," + color.b + "," + opacity + ")";
}

function updateTransferFunction() {
    renderer.updateTransferFunction(function (value) {
        // ******* Your solution here! *******
        
        // Given a voxel value in the range [0.0, 1.0],
        // return a (probably somewhat transparent) color

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        var gradient = context.createLinearGradient(0, 0, 255, 0);

        gradient.addColorStop(colors[0], getRBGA(d3.rgb(colorA.getColor()), colors[0]));
        gradient.addColorStop(colors[1], getRBGA(d3.rgb(colorA.getColor()), colors[1]));
        gradient.addColorStop(colors[2], getRBGA(d3.rgb(colorB.getColor()), colors[2]));
        gradient.addColorStop(colors[3], getRBGA(d3.rgb(colorB.getColor()), colors[3]));
        gradient.addColorStop(colors[4], getRBGA(d3.rgb(colorC.getColor()), colors[4]));
        gradient.addColorStop(colors[5], getRBGA(d3.rgb(colorC.getColor()), colors[5]));
        gradient.addColorStop(colors[6], getRBGA(d3.rgb(colorD.getColor()), colors[6]));
        gradient.addColorStop(colors[7], getRBGA(d3.rgb(colorD.getColor()), colors[7]));
        gradient.addColorStop(colors[8], getRBGA(d3.rgb(colorE.getColor()), colors[8]));
        gradient.addColorStop(colors[9], getRBGA(d3.rgb(colorE.getColor()), colors[9]));

        return gradient;
    });
}

function setup() {
    d3.select('#volumeMenu').on('change', function () {
        renderer.switchVolume(this.value);
        console.log(this.value + ' histogram:', getHistogram(this.value, 0.025));
    });
    console.log('bonsai histogram:', getHistogram('bonsai', 0.025));
    updateTransferFunction();
}

/*

You shouldn't need to edit any code beyond this point
(though, as this assignment is more open-ended, you are
welcome to edit as you see fit)

*/


function getHistogram(volumeName, binSize) {
    /*
    This function resamples the histogram
    and returns bins from 0.0 to 1.0 with
    the appropriate counts
    (binSize should be between 0.0 and 1.0)
    
    */
    
    var steps = 256,    // the original histograms ranges from 0-255, not 0.0-1.0
        result = [],
        thisBin,
        i = 0.0,
        j,
        nextBin;
    while (i < 1.0) {
        thisBin = {
            count : 0,
            lowBound : i,
            highBound : i + binSize
        };
        j = Math.floor(i * steps);
        nextBin = Math.floor((i + binSize) * steps);
        while (j < nextBin && j < steps) {
            thisBin.count += Number(allHistograms[volumeName][j].count);
            j += 1;
        }
        i += binSize;
        result.push(thisBin);
    }
    return result;
}

/*
Program execution starts here:

We create a VolumeRenderer once we've loaded all the csv files,
and VolumeRenderer calls setup() once it has finished loading
its volumes and shader code

*/
var loadedHistograms = 0,
    volumeName,
    histogramsToLoad = {
        'bonsai' : 'volumes/bonsai.histogram.csv',
        'foot' : 'volumes/foot.histogram.csv',
        'teapot' : 'volumes/teapot.histogram.csv'
    };

function generateCollector(name) {
    /*
    This may seem like an odd pattern; why are we generating a function instead of
    doing this inline?
    
    The trick is that the "volumeName" variable in the for loop below changes, but the callbacks
    are asynchronous; by the time any of the files are loaded, "volumeName" will always refer
    to "teapot"**. By generating a function this way, we are storing "volumeName" at the time that
    the call is issued in "name".
    
    ** This is yet ANOTHER javascript quirk: technically, the order that javascript iterates
    over an object's properties is arbitrary (you wouldn't want to rely on the last value
    actually being "teapot"), though in practice most browsers iterate in the order that
    properties were originally assigned.
    
    */
    return function (error, data) {
        if (error) {
            throw new Error("Encountered a problem loading the histograms!");
        }
        allHistograms[name] = data;
        loadedHistograms += 1;
        
        if (loadedHistograms === Object.keys(histogramsToLoad).length) {
            renderer = new VolumeRenderer('renderContainer', {
                'bonsai': 'volumes/bonsai.raw.png',
                'foot': 'volumes/foot.raw.png',
                'teapot': 'volumes/teapot.raw.png'
            }, setup);
        }
    };
}

for(volumeName in histogramsToLoad) {
    if (histogramsToLoad.hasOwnProperty(volumeName)) {
        d3.csv(histogramsToLoad[volumeName], generateCollector(volumeName));
    }
}
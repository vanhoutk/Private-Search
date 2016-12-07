/**
 * This file encompasses all of the javascript for the browser action
 */
var debug = 1; // controls level of logging to console, 0=no logging, 1=basic logging
function log(msg) { console.log(msg); }

// Draw a heatmap graph of the PRI history
function draw_graph(pri_history)
{
    var x = [], y = [], z = [];
    x = pri_history['gambling'].t; // Assume that all categories have same x-axis values (time values)
    for (var label in pri_history)
    {
        y.push(label); // Label name
        z.push(pri_history[label].pri); // Average PRI value for label
    }

    var data =
    [{
        x: x, y: y, z: z,
        type: 'heatmap',
        colorscale: [[0, 'rgb(255,255,255)'], [0.25, 'rgb(31,120,180)'], [0.45, 'rgb(178,223,138)'],
                    [0.65, 'rgb(51,160,44)'], [0.85, 'rgb(251,154,153)'], [1, 'rgb(227,26,28)']]
    }];

    var layout =
    {
        xaxis: { type: 'date' },
        yaxis: { type: 'category' },
        margin: { t: 30, b: 70, l: 100 }
    };

    Plotly.newPlot('plot', data, layout);
}

function new_category()
{
    // Grab category name from form
    category_name = document.getElementById("new_category").value;

    // Add the new category and update the data
    chrome.runtime.sendMessage({subject:'add_label', category_name: category_name});
    // TODO: Possibly refresh the map with the new data?
 
    input_box = document.getElementById("new_category")
    input_box.value = ""
    ok_message = document.createElement('div');
    ok_message.innerHTML = "<p class=\"success\"><b>New category created</b></p>";
    input_box.parentNode.appendChild(ok_message);
}

function export_pri_history()
{
    // TODO: Add functionality for exporting
}

document.getElementById('new_category_button').onclick = new_category;
document.getElementById('export_button').onclick = export_pri_history;


// Load history from local storage
(debug > 0) && log("popup/index: Loading pri_history");
var pri_history_str = localStorage.getItem("pri_history");

var pri_history = [];
if (pri_history_str)
{
    pri_history = JSON.parse(pri_history_str);
    draw_graph(pri_history);
}


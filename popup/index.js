/**
 * This file encompasses all of the javascript for the browser action
 */
var debug = 1; // controls level of logging to console, 0=no logging, 1=basic logging
function log(msg) { console.log(msg); }

// Draw a heatmap graph of the PRI history
function draw_graph(pri_history)
{
    (debug > 0) && log("draw_graph():")
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

// Load history from local storage
(debug > 0) && log("popup/index: Loading pri_history");
var pri_history_str = localStorage.getItem("pri_history");

var pri_history = [];
if (pri_history_str)
{
    pri_history = JSON.parse(pri_history_str);
    draw_graph(pri_history);
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
    var current_pri_history = localStorage.getItem("pri_history");
    var current_time = Date.now();
    var file_name = "PRI_history_at_" + current_time.toString() + ".json";

    log("export_pri_history(): " + current_pri_history);

    console.save(current_pri_history, file_name);

    // Export ad history
    //var current_ad_history = localStorage.getItem("ad_history");
    //var file_name_2 = "Ad_history_at_" + current_time.toString() + ".json";

    //log("export_pri_history(): " + current_ad_history);

    //console.save(current_ad_history, file_name_2);

    //window.location = "data:text/json, " + current_pri_history; 

    /*chrome.downloads.download({
        url: "data:text/json, " + current_pri_history,
        filename: file_name,
        conflictAction: "uniquify", // or "overwrite" / "prompt"
        saveAs: false, // true gives save-as dialogue
    }, function(downloadId) {
        console.log("Downloaded item with ID", downloadId);
    });*/
}

document.getElementById('new_category_button').onclick = new_category;
document.getElementById('export_button').onclick = export_pri_history;

// Function for saving the pri history to the user's downloads
// Source: http://bgrins.github.io/devtools-snippets/#console-save
(function(console){

    console.save = function(data, filename){

        if(!data) {
            console.error('Console.save: No data')
            return;
        }

        if(!filename) filename = 'console.json'

        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }

        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')

        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)
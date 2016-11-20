/*  This file encompasses all of the javascript for the browser action
*/
var debug = 1; // controls level of logging to console, 0=no logging, 1=basic logging
function log(msg){ console.log(msg); }

function draw_graph(pri_history){
  
    var x=[], y=[], z=[];
    x = pri_history['gambling'].t; // assume all categories have same x-axis values, for now
    for (var label in pri_history) {
      y.push(label);
      z.push(pri_history[label].pri);
    }
    var data = [{
      z: z,
      x: x,
      y: y,
      type: 'heatmap',
      colorscale: [[0, 'rgb(255,255,255)'], [0.25, 'rgb(31,120,180)'], [0.45, 'rgb(178,223,138)'],
      [0.65, 'rgb(51,160,44)'], [0.85, 'rgb(251,154,153)'], [1, 'rgb(227,26,28)']]
    }];
    var layout = {
      xaxis: {
        type : 'date'
      },
      yaxis: {
        type : 'category'
      },
      margin: {
        t:30, b:50, l:100
      }
    };
    Plotly.newPlot('plot', data, layout);
    //console.log(data);
    //console.log(pri_history.gambling.pri);
}

function new_category(){
    // Grab category name from form
    category_name = document.getElementById("new_category").value;

    chrome.runtime.sendMessage({subject:'add_label', category_name: category_name});
 
    input_box = document.getElementById("new_category")
    input_box.value = ""
    ok_mesg = document.createElement('div');
    ok_mesg.innerHTML = "<p class=\"success\"><b>New category created</b></p>";
    input_box.parentNode.appendChild(ok_mesg);
}

document.getElementById('new_category_button').onclick = new_category;

// load history from local storage
(debug>0)&&log("loading pri_history");
var pri_history_str = localStorage.getItem("pri_history");
var pri_history=[];
if (pri_history_str) {
  pri_history = JSON.parse(pri_history_str);
  draw_graph(pri_history);
}


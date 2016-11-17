/*  This file encompasses all of the javascript for the browser action
*/
var debug = 1; // controls level of logging to console, 0=no logging, 1=basic logging
function log(msg){ console.log(msg); }

function draw_graph(pri_history){
  
    var ctx = document.getElementById("myCanvas").getContext("2d");
    var datasets=[];
    for (var label in pri_history) {
       datasets.push({data:pri_history[label].pri, label:label});
    }
    var c = new Chart(ctx, {
      type: 'line',
      data: {
        labels: pri_history.gambling.t,  //TO DO: allow different x-axis points for each curve
        //datasets: datasets // TO DO: plot is cluttered when plot all categories together
        datasets: [{
          label: 'gambling',
          data: pri_history.gambling.pri
        }]
      },
      options: {
        scales: {xAxes: [{type: "time",time: {unit:'hour'} }]},
      }
    });
 
    console.log(pri_history.gambling.pri);
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


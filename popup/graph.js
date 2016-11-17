/*  This file encompasses all of the javascript for the browser action, i.e. what shows when you press the button in the browser toolbar
    Most of this involves drawing the graph.
    There is also functionality to export all of the data as well as adding new categories
*/

var colors = ['#ffd700', '#0000ff', '#800080','#00ff00', '#81d8d0', '#990000', '#191970', '#8a2be2', '#4169e1'];
var x_axis_height = 600;
var y_axis_height = 300;

function get_max(arr){

    var max=0;
    for(var i=0; i<arr.length; i++){
        if (arr[i] > max){
            max = arr[i];
        }
    }
    return max;
}

function get_min(arr){
    var min=0;
    for(var i=0; i<arr.length; i++){
        if( arr[i]<min){
            min = arr[i];
        }
    }
    return min;
}

function get_y_axis_multiplier(pri_history, y_axis_height){
    var pri_range = 0;
    var max_pri=0;
    if(true || pri_history === null){
        return y_axis_height / 2 ;
    }
    for(key in pri_history){
        for(var i=0; i< pri_history[key].length; i++){
            new_max = pri_history[key][i];
            if (new_max > max_pri){
                max_pri = new_max;
            }
        }
    }
    var min_pri = 20;
    for(key in pri_history){
        for(var i=0; i<pri_history[key].length; i++){
            new_min = pri_history[key][i];
            if(new_min < min_pri){
                min_pri = new_min;
            }
        }
    }
    pri_range = Math.abs(max_pri - min_pri);
    var y_axis_multiplier = y_axis_height / pri_range;
    return y_axis_multiplier;
}


function setupGraph(){
    // Y Axis height is equal to 
    // X axis is constant
    // Y axis multiplier = y axis height divided by range of pri_history

    y_axis_multiplier = get_y_axis_multiplier(pri_history, y_axis_height);

    c = document.getElementById("myCanvas");
    ctx = c.getContext("2d");
    ctx.fillStyle = "#FF0000";
    ctx.lineWidth=1;
    ctx.font = "20px Arial";

    ctx.moveTo(40,0);
    ctx.lineTo(40,y_axis_height);
    ctx.stroke();

    ctx.lineTo(x_axis_height, y_axis_height);
    ctx.stroke();

    ctx.fillText("Time",x_axis_height + 40,y_axis_height);
    ctx.fillText("PRI",0,50);
    ctx.fillText("Now", x_axis_height - 20,y_axis_height + 25);
    ctx.moveTo(x_axis_height,y_axis_height);
    ctx.lineTo(x_axis_height,y_axis_height + 10);
    ctx.stroke();

    ctx.fillText("-5 mins", 20,y_axis_height + 20);
    ctx.moveTo(40,y_axis_height-10);
    ctx.lineTo(40,y_axis_height);
    ctx.stroke();

}

function addPri(time, pri){
    pri_history.push(pri);
    redraw_graph();
}

function redraw_graph(){
  
    c = document.getElementById("myCanvas");
    ctx = c.getContext("2d");

    ctx.clearRect(0, 0, c.width, c.height);
    setupGraph();

    y_axis_multiplier = get_y_axis_multiplier(pri_history, y_axis_height);

    // For all categories
    n=0;
    cat_n = 0;
    category_y_offset = 0;
    for(var key in pri_history){
        
        curr_cat_arr = pri_history[key];
            //}
        // For all pri's in that category
        ctx.strokeStyle = colors[n];
        ctx.fillStyle = colors[cat_n];
        ctx.lineWidth=5;
        

        ctx.beginPath();
        ctx.moveTo(x_axis_height, y_axis_height - (y_axis_multiplier * curr_cat_arr[curr_cat_arr.length-1]));
        for(var j=curr_cat_arr.length-2; j>=0; j--){
            if(x_axis_height-(j*10) <= 40){
                break;
            } 
            ctx.lineTo(x_axis_height - ((10*curr_cat_arr.length)-(j*10)),y_axis_height - (y_axis_multiplier *  curr_cat_arr[j]));
        }
        ctx.stroke();
        if(50 + n*120 > x_axis_height){
            n=0;
            category_y_offset += 19;
        }
        ctx.fillText(categories[cat_n],50 + n*120,y_axis_height+40 + category_y_offset);
        n+=1;
        cat_n +=1;
    }
    ctx.linewidth=2;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#ff0000';
}

function draw_point(x,y, mult){
    // a y of -1 is a null point, don't draw it
    if (y == "-1"){
        return;
    }
    y = parseFloat(y);
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.arc(280-(x*10),400-(y*mult),3,0,2*Math.PI);
    ctx.stroke();
}


// Grabs the full history of pri's from localStorage and puts them in the html for the user to view
function fetch_data(){
    full_history = localStorage.getItem('pri_history');
    obj = JSON.parse(full_history);

    // Iterate on the items, create proper dates from the unix timestamps then remove the old entries
    for (var key in obj) {
        var date_time = new Date(key * 1000);
        var temp = obj[key];
        delete obj[key];
        obj[date_time] = temp;
        
    }

    elem = document.getElementById('export_data');
    elem.innerHTML = "<pre>" + JSON.stringify(obj, null, '\t') + "</pre>";
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
//document.getElementById('export_button').onclick = fetch_data;
//redraw_graph();


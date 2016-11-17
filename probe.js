// Do the probe
function probe(trained_data) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", "http://www.google.com/search?hl=en&q=causes+and+symptoms");
	//xmlHttp.open( "GET", "http://www.google.com/search?hl=en&q=poker");
  xmlHttp.withCredentials = true;
	xmlHttp.send();

	//notify({'url':'Made a probe'});
  (debug>0)&&log('making probe');

  // When the page has loaded, proceed.
	xmlHttp.onreadystatechange = function(){
        if (xmlHttp.readyState == 4) {
            
            // Create a new dom with the page that has loaded, grab the ads from it
            var parser = new DOMParser();
            var doc = parser.parseFromString(xmlHttp.responseText, "text/html");
            //ads = doc.getElementsByClassName("ads-ad");
            var ads = extractAds(doc);

            (debug>0)&&log('num ads on probe page:'+ads.length);
            var avg_pri=new Array(trained_data.labels.length);
            avg_pri.fill(0);
            if (ads.length > 0) {
              // found some adverts
              var ad_proc = processAds(ads);
              var pris = [], cats=[];
              for (var i=0; i<ad_proc.length; i++) {
                  pris[i] = getPRI(trained_data, ad_proc[i]);
                  cats[i] = trained_data.labels[pris[i].indexOf(Math.max.apply(Math, pris[i]))];
              }
              (debug>0)&&log(ad_proc);
              (debug>0)&&log(cats);
          
              // Average pri_arr returns an array of floats.
              avg_pri = average(pris);
              (debug>0)&&log(avg_pris);
            }

            // load history from local storage
            (debug>0)&&log("loading pri_history");
            var pri_history_str = localStorage.getItem("pri_history");
            var pri_history = JSON.parse(pri_history_str);
          
            (debug>0)&&log("updating pri_history with new data");
            var unixtime = String(Math.floor(Date.now() / 1000));
            var t=Date.now();
            for (var i=0; i<trained_data.labels.length; i++) {
              pri_history[trained_data.labels[i]].t.push(t);
              pri_history[trained_data.labels[i]].pri.push(avg_pri[i]);
            }
            (debug>0)&&log(pri_history);
          
            // update local storage
            (debug>0)&&log("saving pri_history");
            localStorage.setItem('pri_history', JSON.stringify(pri_history));
        }
    };
}

// Get the average of each of the lists provided in a list
function average(nums){
    if (nums.length === 0) {
        return [-1];
    }
    var total = [];
    var length = nums.length;
    var i = 0;

    // Loop on the lists and get their totals
    while (i<length){
        total.push(0);
        for(var j=0; j<nums[i].length; j++){
            total[i] += parseFloat(nums[i][j]);
        }
        i++;
    }
    var average = []; 

    // Loop on the totals and divide by the length of each list
    for(var i=0; i<total.length; i++){
        average.push(total[i]/nums[i].length);
    }

    // Return a list of the averages of the lists
    return average;
}

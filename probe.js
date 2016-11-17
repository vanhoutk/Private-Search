// Do the probe
function probe()
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", "http://www.google.com/search?hl=en&q=causes+and+symptoms");
	//xmlHttp.open( "GET", "http://www.google.com/search?hl=en&q=poker");
  xmlHttp.withCredentials = true;
	xmlHttp.send();

	//notify({'url':'Made a probe'});
  console.log('making probe');

  // When the page has loaded, proceed.
	xmlHttp.onreadystatechange = function(){
        if (xmlHttp.readyState == 4) {
            
            // Create a new dom with the page that has loaded, grab the ads from it
            var parser = new DOMParser();
            var doc = parser.parseFromString(xmlHttp.responseText, "text/html");
            //ads = doc.getElementsByClassName("ads-ad");
            var ads = extractAds(doc);

            console.log('num ads on probe page:'+ads.length);
            if (ads.length==0) return; // nothing to see here

            var ad_proc = processAds(ads);
            var pris = [], cats=[];
            for (var i=0; i<ad_proc.length; i++) {
                pris[i] = getPRI(trained_data, ad_proc[i]);
                cats[i] = categories[pris[i].indexOf(Math.max.apply(Math, pris[i]))];
            }
            (debug>0)&&log(ad_proc);
            (debug>0)&&log(cats);
            (debug>0)&&log(average(pris));
            
            // Average pri_arr returns an array of floats.
            var avg_pri = average(pris);
            pri_history.t.push(String(Math.floor(Date.now() / 1000)));  // unix timestamp
            pri_history.pris.push(avg_pri);
          
            // update local storage -- not really needed here, just makes sure log is persistent
            localStorage.setItem('pri_history', JSON.stringify(pri_history));
            (debug>0)&&log(pri_history);
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

function probe(trained_data)
{
    var xmlHttp = new XMLHttpRequest();
    //xmlHttp.open( "GET", "http://www.google.com/search?hl=en&q=causes+and+symptoms");
    xmlHttp.open( "GET", "http://www.google.com/search?hl=en&q=help+and+advice");
    xmlHttp.withCredentials = true;
    xmlHttp.send();

    (debug > 0) && log('probe(): Making probe.');

    // When the page has loaded, proceed.
	xmlHttp.onreadystatechange = function()
    {
        // readyState == 4 means the operation has been complete.
        if (xmlHttp.readyState == 4) {

            // Create a new dom with the page that has loaded
            var parser = new DOMParser();
            var doc = parser.parseFromString(xmlHttp.responseText, "text/html");

            // Extract the ads from the page
            var ads = extractAds(doc);

            (debug > 0) && log ('probe(): Number of ads on probe page: ' + ads.length);

            // Create a new array and fill it with 0s
            var average_pri = new Array(trained_data.labels.length);
            average_pri.fill(0);

            if (ads.length > 0)
            {
                // Process the ads and return an array of arrays of the words in the ad with stop words removed and the remaining words stemmed.
                var ads_words = processAds(ads);
                var pris = [], categories=[];

                // Cycle through the array for each ad and
                for (var i = 0; i < ads_words.length; i++) {
                    pris[i] = getPRI(trained_data, ads_words[i]); // pris is now a 2d matrix of pri[ad][pri for each label]
                    // Get the label corresponding to the max pri value returned for the ad
                    categories[i] = trained_data.labels[pris[i].indexOf(Math.max.apply(Math, pris[i]))];
                }

                // average(pris) sums up the total pris for each ad and divides them by the number of labels.
                // average_pri is a 1d
                // TODO: Comment this properly
                average_pri = average(pris);

                (debug > 0) && log(ads_words);
                (debug > 0) && log(categories);
                (debug > 0) && log(average_pri);
            }

            // Load the PRI history from local storage
            (debug > 0) && log("probe(): Loading pri_history")

            var pri_history_str = localStorage.getItem("pri_history");
            var pri_history = JSON.parse(pri_history_str);
          
            (debug > 0) && log("probe(): Updating pri_history with new data");

            var t = Date.now();

            for (var i = 0; i < trained_data.labels.length; i++) {
                pri_history[trained_data.labels[i]].t.push(t);
                pri_history[trained_data.labels[i]].pri.push(average_pri[i]);
            }

            (debug > 0) && log(pri_history);
            (debug > 0) && log("saving pri_history");
            // Update local storage
            localStorage.setItem('pri_history', JSON.stringify(pri_history));
        }
    };
}


// TODO: Possibly change the logic here
// Get the average of each of the lists provided in a list
function average(nums)
{
    if (nums.length === 0)
    {
        return [-1];
    }

    var total = [];
    var length = nums.length;
    var i = 0;

    // Loop on the lists and get their totals
    while (i < length)
    {
        total.push(0);
        for(var j = 0; j < nums[i].length; j++){
            total[i] += parseFloat(nums[i][j]);
        }
        i++;
    }
    var average = []; 

    // Loop on the totals and divide by the length of each list
    for(var i = 0; i < total.length; i++){
        average.push(total[i]/nums[i].length);
    }

    // Return a list of the averages of the lists
    return average;
}

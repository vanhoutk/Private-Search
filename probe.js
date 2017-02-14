var probe_count = 0;

function probe(trained_data)
{
    var xmlHttp = new XMLHttpRequest();
    //xmlHttp.open( "GET", "http://www.google.com/search?hl=en&q=causes+and+symptoms");
    //xmlHttp.open( "GET", "http://www.google.com/search?hl=en&q=help+and+advice");
    xmlHttp.open( "GET", "http://www.google.com/search?hl=en&q=poker");
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

            if (ads.length > 0)
            {
                // Process the ads and return an array of arrays of the words in the ad with stop words removed and the remaining words stemmed.
                var ads_words = processAds(ads);
                var pris = [], categories=[];
                var ads_words_joined = [];

                // Join all of the individual ad arrays to form a single array of the words in the ads on the page
                for(var i = 0; i < ads_words.length; i++)
                {
                    //log(ads_words[i]);
                    for(var j = 0; j < ads_words[i].length; j++)
                    {
                        ads_words_joined.push(ads_words[i][j]);
                    }
                    //log(ads_words_joined);
                }

                pris = getPRI(trained_data, ads_words_joined);
                //categories[i] = trained_data.labels[pris.indexOf(Math.max.apply(Math, pris))];

                (debug > 0) && log(ads_words_joined);
                //(debug > 0) && log(categories);
                (debug > 0) && log(pris);
            }

            // Load the PRI history from local storage
            (debug > 0) && log("probe(): Loading pri_history");

            var pri_history_str = localStorage.getItem("pri_history");

            (debug > 0) && log("probe(): pri_history " + pri_history_str);

            var pri_history = JSON.parse(pri_history_str);
          
            (debug > 0) && log("probe(): Updating pri_history with new data");

            (debug > 0) && log("probe(): label.length " + trained_data.labels.length);

            // TODO: Add more logging here to see problem

            var t = Date.now();

            for (var i = 0; i < trained_data.labels.length; i++) {
                pri_history[trained_data.labels[i]].t.push(t);
                pri_history[trained_data.labels[i]].probe.push(probe_count);
                if(ads.length > 0)
                    pri_history[trained_data.labels[i]].pri.push(pris[i]);
                else
                    pri_history[trained_data.labels[i]].pri.push(pri_history[trained_data.labels[i]].pri[pri_history[trained_data.labels[i]].pri.length - 1]);
            }

            probe_count++;

            (debug > 0) && log(pri_history);
            (debug > 0) && log("saving pri_history");
            // Update local storage
            localStorage.setItem('pri_history', JSON.stringify(pri_history));
        }
    };
}
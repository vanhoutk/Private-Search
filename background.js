/*
    This is the main background file. Most of the add-on code occurs here.
    Training is called from here.
    Communication with both the browser action and the content script happens here.
*/
var debug = 1; // Controls the level of logging to console: 0 = No logging, 1 = Basic logging
var profile = 0; // Change to 1 for performance timing info (Training)
var curr_url = ""; // Current google url the user is on (in case they click a link and press back)
var searchCount = 0; // Number of searches a user has done without a probe query being sent

function log(msg){ console.log(msg); }

// When we load the add-on, do the training
var trained_data = training();

(debug > 2) && log(row_probs);
(debug > 2) && log(col_probs);

// And get the PRI history
// pri_history is a structure, e.g. pri_history.gambling gives the time history
// for the gambling topic (the time history is a list of {t:<time>, pri:<value>} points)
var pri_history_str = localStorage.getItem("pri_history");
var init_history = true; // Change to true to force clearing of pri_history
if (init_history || pri_history_str == null)
{
    // Initialise history
    (debug > 0) && log("background: Initialising pri_history");
    var pri_history = {};
    for (var i = 0; i < trained_data.labels.length; i++)
    {
        pri_history[trained_data.labels[i]] = {t:[], probe:[], ads:[], pri:[]};
    }
    localStorage.setItem('pri_history', JSON.stringify(pri_history));
}
else
{
  // Load from local storage
  (debug > 0) && log("background: Reloading pri_history");
  pri_history = JSON.parse(pri_history_str);
}

// Ad History Initalisation
//var ad_history_str = localStorage.getItem("ad_history");
//if(ad_history_str == null)
//{
//    var ad_history = {};
//    localStorage.setItem('ad_history', JSON.stringify(ad_history));
//}

//probe(trained_data);

function onError(error)
{
    log(`Error: ${error}`);
}

// Add a listener to received messages from foreground web pages i.e. user pages
chrome.runtime.onMessage.addListener(message_recv);

// General listening function, the script will receive several different kinds of messages. 
// The subject needs to be checked in order to distinguish what the messages are for.
//var count = 0;

function message_recv(message, sender, sendResponse)
{
    (debug > 2) && log('message_recv():');

    var categories = trained_data.labels;

    if(message.subject == 'add_training_data')
    {
        // Add a new labelled advert to our training data
        label = message.label;
        keywords = message.keywords[0];
        trained_data = addTrainingData(trained_data, keywords, label);
    }
    else if (message.subject == 'request_categories') // Called whenever the user is on a google page
    {
        // Reply with the list of advert categories from the trained data
        if (!sendResponse) {log('ERROR: message_recv() called without sendResponse');}
        sendResponse({subject: 'categories', categories: categories});

        /*count += 1;
        if (count >= 2) // TODO: Need to update this logic to account for user searches correctly
        {
            // Make a probe every 5 user searches
            probe(trained_data);
            count = 0;
        }*/
    }
    /*else if (message.subject == "make_probe")
    {
        probe(trained_data);
    }*/
    else if (message.subject == 'request_pri_score')
    {
        // Given an advert, calculate its PRI score and reply with the suggested label
        if (!sendResponse) {log('ERROR: message_recv() called without sendResponse');}

        (debug > 2) && log(message.ad_text);

        // TODO: update to PRI+
        var pri = getPRI(trained_data,message.ad_text);

        (debug > 2) && log('message_recv(): ad = ' + message.ad + ', PRI = ' + pri);

        // Suggest category with highest PRI score as label for ad
        suggested_category = categories[pri.indexOf(Math.max.apply(Math, pri))];
        sendResponse({ad:message.ad, category: suggested_category});
    }
    else if (message.subject == 'add_label')
    {
        // Add a new label (advert category)
        (debug > 0) && console.log('message_recv(): add_label ' + message.category_name);

        trained_data = addLabel(trained_data, message.category_name);
        categories = trained_data.labels;;
        // pri_history.pris.push([]);
        // TODO: Refresh drop down boxes on user pages
        // TODO: Update the pri_history
    }
}

// Calling this sends a notification to the user
function notify(message)
{
    chrome.notifications.create
    ({
        "type": "basic",
        "iconUrl": "http://www.google.com/favicon.ico",
        "title": "Notification",
        "priority": 1,
        "message": message.url
    });
}

function handleUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.url) {
    console.log ("sc: " + searchCount + " - " + changeInfo.url)  
    if (changeInfo.url.indexOf('google') != -1) {
        if (changeInfo.url != curr_url)  {
            //console.log("Tab: " + tabId + " URL changed to " + changeInfo.url);
            curr_url= changeInfo.url;  
            searchCount++;
            console.log ("sc: " + searchCount + " - " + changeInfo.url)  

            if (searchCount >= 5){
                (debug > 0) && log("Probing at sc: " + searchCount ); 
                probe(trained_data);
                searchCount = 0;
            }
        }
    }  
    console.log("Tab: " + tabId +
                " URL changed to " + changeInfo.url);
  }
}

chrome.tabs.onUpdated.addListener(handleUpdated);

/*function sendMessageToTabs(tabs)
{
    for (let tab of tabs)
    {
        console.log("Check page: " + tab.url);
        // Check if the tab is a google page
	    if (tab.url.indexOf('google') != -1) {
  		    browser.tabs.sendMessage(
		        tab.id,
		        {instruction: "CheckAds"}
		    ).then(response => {
			    log(response.response);
		    }).catch(onError);
	    }
    }
 }

 // Function which prints whether all alarms were cleared.
function onClearedAll(wasCleared) {
    log(wasCleared);  // true/false
}

// Clear all of the alarms
var clearAlarms = browser.alarms.clearAll();
clearAlarms.then(onClearedAll);

// Create a new alarm to check for ads every 6 seconds
browser.alarms.create("AdsAlarm", {delayInMinutes: 0.1, periodInMinutes: 0.1} );

browser.alarms.onAlarm.addListener((alarm) => {
	log("Alarm raised");
    var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
    gettingActiveTab.then(sendMessageToTabs, onError);
});*/

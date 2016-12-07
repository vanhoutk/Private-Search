/*
    This is the main background file. Most of the addon code occurs here.
    Training is called from here.
    Communication with both the browser action and the content script happens here.
*/
var debug = 1; // controls level of logging to console, 0=no logging, 1=basic logging
var profile = 0; // change to 1 for performance timing info
function log(msg){ console.log(msg); }

// When we load the addon, do the training
var trained_data = training();
(debug>2)&&log(row_probs); (debug>2)&&log(col_probs);

// And get the PRI history
// pri_history is a structure, e.g. pri_history.gambling gives the time history
// for the gambling topic (the time history is a list of {t:<time>, pri:<value>} points)
var pri_history_str = localStorage.getItem("pri_history");
var init_history=true; // change to true to force clearing of pri_history
if (init_history || pri_history_str == null) {
  // initialise history
  (debug>0)&&log("initialising pri_history");
  var pri_history = {};
  for (var i=0; i<trained_data.labels.length; i++) {
    pri_history[trained_data.labels[i]] = {t:[], pri:[]};
  }
  localStorage.setItem('pri_history', JSON.stringify(pri_history));
} else {
  // load from local storage
  (debug>0)&&log("reloading pri_history");
  pri_history = JSON.parse(pri_history_str);
}
probe(trained_data);

function onError(error) {
  console.log(`Error: ${error}`);
}


// Add a listener to receive messages from foreground web pages i.e. user pages
chrome.runtime.onMessage.addListener(message_recv);

// General listening function, the script will receive several different kinds of messages. 
// The subject needs to be checked in order to distinguish what the messages are for.
var count=0;
function message_recv(message, sender, sendResponse){
    (debug>2)&&log('message_recv()');
    var categories = trained_data.labels;
    if(message.subject == "test"){
        console.log ("test received")
        sendResponse({response : "received"})};
    if(message.subject == "test2"){
        console.log ("test2 received")
        sendResponse({response : "received2"})};
    if(message.subject == 'add_training_data'){
        // add a new labelled advert to our training data
        label = message.label;
        keywords = message.keywords[0];
        trained_data = addTrainingData(trained_data, keywords, label);
    } else if (message.subject == 'request_categories'){
        // reply with the list of advert categories from training data
        if (!sendResponse) {console.log('ERROR: message_recv called without sendResponse');}
        sendResponse({subject: 'categories', categories: categories});
        count += 1;
        if (count >=5) {
          // make a probe every 5 user searches
          probe(trained_data);
          count=0;
        }
    } else if (message.subject == 'request_pri_score') {
        // given an advert, reply with its PRI score
        if (!sendResponse) {console.log('ERROR: message_recv called without sendResponse');}
        (debug>2)&&log(message.ad_text);
        var pri = getPRI(trained_data,message.ad_text);
        // suggest category with highest PRI score as label for ad
        // TO DO: update to PRI+
        (debug>2)&&log('ad='+message.ad+'PRI='+pri);
        cat = categories[pri.indexOf(Math.max.apply(Math, pri))];
        sendResponse({ad:message.ad, category: cat});
    } else if (message.subject == 'add_label') {
        // add a new label (advert category)
        (debug>0)&&console.log('add_label '+message.category_name);
        trained_data = addLabel(trained_data, message.category_name);
        categories = trained_data.labels;;
        //pri_history.pris.push([]);
        //TO DO: refresh drop down boxes on user pages
    }
}

// Calling this sends a notification to the user
function notify(message) {
    chrome.notifications.create({
    "type": "basic",
    "iconUrl": "http://www.google.com/favicon.ico",
    "title": "Notification",
    "priority": 1,
    "message": message.url
  });
}


function sendMessageToTabs(tabs) {
  for (let tab of tabs) {
    console.log("Check page: " + tab.url);  
	if (tab.url.indexOf('google') != -1) {
  		browser.tabs.sendMessage(
		tab.id,
		{instruction: "CheckAds"}
		).then(response => {
			//console.log("Message from the content script:");
			console.log(response.response);
		}).catch(onError);
	}
  }
 }

function onClearedAll(wasCleared) {
    log(wasCleared);  // true/false
}

var clearAlarms = browser.alarms.clearAll();
clearAlarms.then(onClearedAll);

browser.alarms.create("AdsAlarm", {delayInMinutes: 0.1, periodInMinutes: 0.1} );

browser.alarms.onAlarm.addListener((alarm) => {
	log("Alarm raised");
    var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
    gettingActiveTab.then(sendMessageToTabs, onError);
	
});





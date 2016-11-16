/*
    This is the main background file. Most of the addon code occurs here.
    Training is called from here.
    Communication with both the browser action and the content script happens here.
*/

// When we load the addon, do the training
var trained_data = training();
var categories = trained_data.labels;
//console.log(row_probs); console.log(col_probs);

var t=[], pris=[];
for( var i=0; i<categories.length; i++){
    pris[categories[i]] = [];
}
var pri_history = {'t':t, 'pris':pris};


// Add a listener
chrome.runtime.onMessage.addListener(message_recv);

// General listening function, the script will receive several different kinds of messages. 
// The subject needs to be checked in order to distinguish what the messages are for.
var count=0;
function message_recv(message, sender, sendResponse){
    //console.log('message_recv()');
    //notify({'url':'message_recv:'+message.subject+' '+sender.tab.url});
    if(message.subject == 'add_training_data'){
        label = message.label;
        keywords = message.keywords[0];
        trained_data = addTrainingData(trained_data, keywords, label);
    } else if (message.subject == 'request_categories'){
        if (!sendResponse) {console.log('ERROR: message_recv called without sendResponse');}
        sendResponse({subject: 'categories', categories: JSON.stringify(categories)});
        count += 1;
        if (count >=5) {
          // make a probe
          probe();
          count=0;
        }
    } else if (message.subject == 'request_pri_score') {
        if (!sendResponse) {console.log('ERROR: message_recv called without sendResponse');}
        //console.log(message.ad_text);
        var pri = getPRI(trained_data,message.ad_text);
        // suggest category with highest PRI score as label for ad
        // TO DO: update to PRI+
        //console.log('ad='+message.ad+'PRI='+pri);
        cat = categories[pri.indexOf(Math.max.apply(Math, pri))];
        sendResponse({ad:message.ad, category: cat});
    } 
}

// Calling this sends a notification to the user
function notify(message) {
    //console.log("Creating a notification....");
    chrome.notifications.create({
    "type": "basic",
    "iconUrl": "http://www.google.com/favicon.ico",
    "title": "Notification",
    "priority": 1,
    "message": message.url
  });
}






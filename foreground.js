/*
    this is the script which runs on the individual google pages. 
    It gets the ads on the current page and adds the suggested category as well as adding a select box to each ad allowing the user to add an ad to a category.

    Note that a certain amount of communication has to be done between this script and background.js.
    since index.js only has access to the localStorage for the current  webpage and not the addons localStorage, we must retrieve the categories list from background.js

    Then, when the user adds an ad to a category, index.js must communicate this back to background.js with the full text of the ad.
*/

var debug = 1; // controls level of logging to console, 0=no logging, 1=basic logging
function log(msg){ console.log(msg); }

function init(request, sender, sendResponse){
  // request contains category info supplied by background process of add-on (so persists
  // across web pages)
  
  if(request.subject != 'categories'){
    console.log('ERROR: init() called with subject='+request.subject);
  }
  (debug>0)&&log('init'+request.categories);
  
  // get adverts in page
  var ads = extractAds(document);
  (debug>0)&&log('num ads on user page: '+ads.length);
  categories = request.categories;
  // now construct a button and drop down box and add to each advert in turn
  for (var i=0; i<ads.length; i++){
    // extract text from advert and tokenize.  do this here, before we add text
    // in select drop down box etc to the advert
    var ad_proc = processAds([ads[i]]);

    // create select drop down box with possible advert categories
    var s = '<select><option value="null">Select a Category</option>'; // HTML string
    for(var j=0; j<categories.length; j++){
      s += '<option value="';
      s += categories[j];
      s += '">';
      s += categories[j];
      s += '</option>';
    }
    s += '</select>';
    // and create a button
    var btn = '<button class="category_add_button">Add to Category</button>'
    var div = document.createElement('div');
    div.innerHTML = s;
    ads[i].appendChild(div.childNodes[0]);
    div.innerHTML = btn
    ads[i].appendChild(div.childNodes[0]);
    
    button = div.childNodes[0];
    ads[i].childNodes[ads[i].childNodes.length-1].onclick = add_ad_to_category;
 
    // estimate category of this advert using PRI score.  need to use backend to calc PRI score
    chrome.runtime.sendMessage({subject:'request_pri_score', ad_text: ad_proc[0], ad: ads[i].getAttribute('data-hveid')}, function (request) {
      (debug>2)&&console.log('category='+request.category+',ad='+request.ad);
      ad=document.querySelectorAll('[data-hveid="'+request.ad+'"]');
      suspected = document.createElement('div');
      suspected.innerHTML = '<b>Suggested Category</b>: '+request.category;
      ad[0].appendChild(suspected);
    }) ;
   }

  (debug>0)&&log('init completed.');
};


function add_ad_to_category(){
    // tag advert as being in a particular category.  this is used to train PRI.
    select = this.previousSibling; // get select drop down box
    name_of_category = select.options[select.selectedIndex].value;
    (debug>0)&&log('Adding ad to '+name_of_category);

    // Clone the ad and remove what we added so we get an accurate processing of the ad text
    elem = select.parentElement.cloneNode(true);
    elem.removeChild(elem.childNodes[elem.childNodes.length-1]); // "suggested category"
    elem.removeChild(elem.childNodes[elem.childNodes.length-1]); // button
    elem.removeChild(elem.childNodes[elem.childNodes.length-1]); // select drop down box

    keywords = processAds([elem]); // stem and tokenise
    chrome.runtime.sendMessage(message={subject:'add_training_data', label: name_of_category, keywords: keywords});
    (debug>0)&&log('+' + name_of_category + '::' + keywords);

    parent = this.parentElement;
    msg = parent.childNodes[parent.childNodes.length-1];
    msg.innerHTML = '<b>Category</b>:'+name_of_category;
}

document.addEventListener('DOMContentLoaded', function(event) {
  (debug>0)&&log('Add-on loaded...');
  var page_url = window.location.href;

  // Execute only on Google pages
  if (page_url.indexOf('google') != -1) {
      //document.body.style.border = "2px solid red";
      (debug>0)&&log('Page is a google page... request categories info from add-on');
      chrome.runtime.sendMessage({subject:'request_categories'}, init) ;
  }
});


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
  (debug>0)&&log('init '+request.categories);
  
  // get adverts in page
  var ads = extractAds(document);
  (debug>0)&&log('num ads on user page: '+ads.length);
  categories = request.categories;
  
  // now construct a button and drop down box and add to each advert in turn
  for (var i=0; i<ads.length; i++){
    // extract text from advert and tokenize.  do this here, before we add text
    // in select drop down box etc to the advert
    var ad_proc = processAds([ads[i]]);
    
    // estimate category of this advert using PRI score.  need to use backend to calc PRI score
    chrome.runtime.sendMessage({subject:'request_pri_score', ad_text: ad_proc[0], ad: ads[i].getAttribute('data-hveid')}, function (request) {
      (debug>2)&&console.log('category='+request.category+',ad='+request.ad);
      ad=document.querySelectorAll('[data-hveid="'+request.ad+'"]');
      
      // id for this html, so that we can easily find this element again
      var id = Math.random().toString(36).substr(2, 8);
      
      // tag advert with suggested category
      suspected = document.createElement('div');
      suspected.dataset.pri_id = id;
      suspected.dataset.pri_cat = request.category;
      suspected.innerHTML = '<b>Suggested Category</b>: '+request.category+'&nbsp;&nbsp;';
      var elem = document.createElement("img"), elem2 = document.createElement("img");
      elem.src = chrome.extension.getURL('tick.png');
      elem.style = 'width: 20px; vertical-align:bottom; cursor:pointer;';
      elem.dataset.img1_pri_id = id;
      elem.onclick = confirm_category;
      elem.onmouseenter = function() {this.style.filter = "brightness(120%)"};
      elem.onmouseleave = function() {this.style.filter = ""};
      suspected.appendChild(elem);
      elem2.src = chrome.extension.getURL('cross.png');
      elem2.style = 'width: 25px; vertical-align:bottom; cursor:pointer; ';
      elem2.dataset.img2_pri_id = id;
      elem2.onclick = showdropdown;
      elem2.onmouseenter = function() {this.style.filter = "brightness(120%)"};
      elem2.onmouseleave = function() {this.style.filter = ""};
      suspected.appendChild(elem2);
      ad[0].appendChild(suspected);
                               
      // create drop down box
      var s = '<select><option value="null">Select a Category</option>'; // HTML string
      for(var j=0; j<categories.length; j++){
        if (categories[j] == request.category) {
          s += '<option selected value="';  // mark suggested value as the default
        } else {
          s += '<option value="';
        }
        s += categories[j];
        s += '">';
        s += categories[j];
        s += '</option>';
      }
      s += '</select>';
      var select = document.createElement('div');
      select.dataset.select_pri_id = id;
      select.innerHTML = s;
      // and create a button
      select.innerHTML += '<button class="category_add_button">Add to Category</button>';
      select.style.display='none'; // hide this for now
      ad[0].appendChild(select);
      }) ;
   }

  (debug>0)&&log('init completed.');
};

function showdropdown(){
  // get the select element with drop down box etc
  var select = document.querySelectorAll('[data-select_pri_id="'+this.dataset.img2_pri_id+'"]');
  // and make it visible
  select[0].style.display='inline';
  // and activate the button
  select[0].childNodes[1].onclick = add_ad_to_category;
}

function add_ad_to_category(){
  // tag advert as being in a particular category.  this is used to train PRI.
  
  // get the selection from the drop down box
  var selectbox = this.previousSibling; // get select drop down box
  var name_of_category = selectbox.options[selectbox.selectedIndex].value;
  (debug>0)&&log('Adding ad to '+name_of_category);

  var select = this.parentElement; // the select box plus button
  
  // Clone the ad and remove what we added so we get an accurate processing of the ad text
  var ad = select.parentElement.cloneNode(true);
  ad.removeChild(ad.childNodes[ad.childNodes.length-1]); // "suggested category"
  ad.removeChild(ad.childNodes[ad.childNodes.length-1]); // button and select drop down box

  add_to_category(ad,name_of_category);

  // update suggested category
  var div = document.querySelectorAll('[data-pri_id="'+select.dataset.select_pri_id+'"]');
  div[0].innerHTML = '<b>Category</b>:'+name_of_category;
  
  // hide drop down box
  select.style.display="none";
}

function confirm_category() {
  //get the div we've added to the advert
  var div = document.querySelectorAll('[data-pri_id="'+this.dataset.img1_pri_id+'"]');
  var name_of_category = div[0].dataset.pri_cat; /// get the suggested category for advert

  // Clone the ad and remove what we added so we get an accurate processing of the ad text
  var ad = div[0].parentElement.cloneNode(true);
  ad.removeChild(ad.childNodes[ad.childNodes.length-1]); // "suggested category"
  ad.removeChild(ad.childNodes[ad.childNodes.length-1]); // button and select drop down box

  add_to_category(ad,name_of_category);

  // update suggested category
  div[0].innerHTML = '<b>Category</b>:'+name_of_category;
  
  // hide drop down box
  var select = document.querySelectorAll('[data-select_pri_id="'+this.dataset.img1_pri_id+'"]');
  select[0].style.display="none";
}

function add_to_category(elem,name_of_category) {
  keywords = processAds([elem]); // stem and tokenise
  chrome.runtime.sendMessage(message={subject:'add_training_data', label: name_of_category, keywords: keywords});
  (debug>0)&&log('+' + name_of_category + '::' + keywords);
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


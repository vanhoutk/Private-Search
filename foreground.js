/*
    this is the script which runs on the individual google pages. 
    It gets the ads on the current page and adds the suggested category as well as adding a select box to each ad allowing the user to add an ad to a category.

    Note that a certain amount of communication has to be done between this script and background.js.
    since foreground.js only has access to the localStorage for the current webpage and not the addons localStorage, we must retrieve the categories list from background.js

    Then, when the user adds an ad to a category, foreground.js must communicate this back to background.js with the full text of the ad.
*/

var debug = 1; // controls level of logging to console, 0=no logging, 1=basic logging

function log(msg){ console.log(msg); }

function init(request, sender, sendResponse)
{

    // request contains category info supplied by background process of add-on (so persists across web pages)
  
    if(request.subject != 'categories')
    {
        log('ERROR: init() called with subject = ' + request.subject);
    }

    (debug > 0) && log('init(): categories = ' + request.categories);

    // Get adverts in page
    var ads = extractAds(content.document);

    (debug > 0) && log('Number of ads on current user page: ' + ads.length);

    categories = request.categories;
  
    // Now construct a button and drop-down box and add to each advert in turn
    for (var i = 0; i < ads.length; i++)
    {
        // Check if there is already a drop-down box or a category has already been selected
	    if(ads[i].innerHTML.indexOf('Suggested Category') == -1 && ads[i].innerHTML.indexOf('Category') == -1)
	    {
            // Extract text from the advert and tokenize. Need to do this before adding text to the drop down box for suggested category.
            (debug > 0) && log ("Processing ad: " + i);

            //chrome.runtime.sendMessage({subject:'test2'}, function (rq){ console.log (msg.response)});

            // Process the ads and return an array of the words in the ad with stop words removed and the remaining words stemmed.
            var ad_words = processAds([ads[i]]);

            (debug > 0) && log("Ad words: " + ad_words[0]);

            // Estimate the category of this advert using PRI score. Need to use the backend to calculate the PRI score.
            // (data-hveid is a unique integer representing the ad on the page)
            chrome.runtime.sendMessage({subject:'request_pri_score', ad_text: ad_words[0], ad: ads[i].getAttribute('data-hveid')}, function (request) {
                (debug > 2) && log('init(): category = ' + request.category + ', ad = ' + request.ad);

                // Select the ad using its hveid
                ad = document.querySelectorAll('[data-hveid="' + request.ad + '"]');
              
                // Create a random id for the div we're creating so that we can easily find this element again.
                var id = Math.random().toString(36).substr(2, 8);
              
                // Create a div element with the suggested category.
                suspected = document.createElement('div');
                suspected.dataset.pri_id = id;
                suspected.dataset.pri_cat = request.category;
                suspected.innerHTML = '<b>Suggested Category</b>: ' + request.category + '&nbsp;&nbsp;';

                // Create a clickable image element for confirming the suggested category
                var tick_image = document.createElement("img"), cross_image = document.createElement("img");
                tick_image.src = chrome.extension.getURL('tick.png');
                tick_image.style = 'width: 20px; vertical-align:middle; cursor:pointer;';
                tick_image.dataset.img1_pri_id = id;
                tick_image.onclick = confirm_category;
                tick_image.onmouseenter = function() {this.style.filter = "brightness(120%)"};
                tick_image.onmouseleave = function() {this.style.filter = ""};
                suspected.appendChild(tick_image);

                // Create a clickable image element for rejecting the suggested category
                cross_image.src = chrome.extension.getURL('cross.png');
                cross_image.style = 'width: 25px; vertical-align:middle; cursor:pointer; ';
                cross_image.dataset.img2_pri_id = id;
                cross_image.onclick = showdropdown;
                cross_image.onmouseenter = function() {this.style.filter = "brightness(120%)"};
                cross_image.onmouseleave = function() {this.style.filter = ""};
                suspected.appendChild(cross_image);

                // Append the div to the bottom of the ad
                ad[0].appendChild(suspected);

                // Create drop down box, filling it with all of the categories, and setting its current selection to the suggested category.
                var s = '<select><option value="null">Select a Category</option>'; // HTML string
                for(var j = 0; j < categories.length; j++){
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

                // Create a div to contain the drop down box, which will originally be hidden.
                var select = document.createElement('div');
                select.dataset.select_pri_id = id;
                select.innerHTML = s;

                // Add a button to confirm drop down selection.
                select.innerHTML += '<button class="category_add_button">Add to Category</button>';
                select.style.display = 'none'; // hide this for now

                // Append the div to the bottom of the ad.
                ad[0].appendChild(select);
            }) ;
        }
    }

    (debug > 0) && log('init(): completed.');
};

function showdropdown()
{
    // Get the select element which contains the drop down box and confirmation button.
    var select = document.querySelectorAll('[data-select_pri_id="'+this.dataset.img2_pri_id+'"]');
    // Make it visible
    select[0].style.display='inline';
    // Add functionality to the button
    select[0].childNodes[1].onclick = add_ad_to_category;
}

function add_ad_to_category()
{
    // Tag the advert as being in a particular category. This is used to train PRI.
  
    // Get the current selection from the drop down box
    var drop_down_box = this.previousSibling; // Get the drop down box
    var name_of_category = drop_down_box.options[drop_down_box.selectedIndex].value;
    (debug > 0) && log('Adding ad to ' + name_of_category);

    var select = this.parentElement; // Div containing the drop down box and button
  
    // Clone the ad and remove what we added so we get an accurate processing of the ad text
    var ad = select.parentElement.cloneNode(true);
    ad.removeChild(ad.childNodes[ad.childNodes.length-1]); // Div containing drop down box & button
    ad.removeChild(ad.childNodes[ad.childNodes.length-1]); // Div containing suggested category

    add_to_category(ad, name_of_category);

    // Change the suggested category to the selected category
    var div = document.querySelectorAll('[data-pri_id="' + select.dataset.select_pri_id + '"]');
    div[0].innerHTML = '<b>Category</b>:' + name_of_category;
  
    // Hide the drop down box
    select.style.display = "none";
}

function confirm_category()
{
    // Get the div containing the suggested category
    var div = document.querySelectorAll('[data-pri_id="'+this.dataset.img1_pri_id+'"]');
    // Get the suggested category for advert
    var name_of_category = div[0].dataset.pri_cat;

    // Clone the ad and remove what we added so we get an accurate processing of the ad text
    var ad = div[0].parentElement.cloneNode(true);
    ad.removeChild(ad.childNodes[ad.childNodes.length-1]); // Div containing drop down box & button
    ad.removeChild(ad.childNodes[ad.childNodes.length-1]); // Div containing suggested category

    add_to_category(ad,name_of_category);

    // Change the suggested category to the selected category
    div[0].innerHTML = '<b>Category</b>:' + name_of_category;
}

function add_to_category(elem,name_of_category)
{
    // Process the ad and return an array of the words in the ad with stop words removed and the remaining words stemmed.
    keywords = processAds([elem]);

    chrome.runtime.sendMessage(message={subject:'add_training_data', label: name_of_category, keywords: keywords});

    (debug > 0) && log('+' + name_of_category + '::' + keywords);
}

// Alarm in the background script cases this to be called whenever we're on a google page
chrome.runtime.onMessage.addListener(request => {
    if (request.instruction == "CheckAds"){
	    (debug > 0) && log('Current tab is a google webpage. Request categories info from add-on.');
	    chrome.runtime.sendMessage({subject:'request_categories'}, init) ;
    }
    return Promise.resolve({response: "Request Categories Sent."});
});
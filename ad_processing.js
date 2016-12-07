/* -------------------------- Main functions -------------------------- */
/**
 * Extract adverts from the currently loaded page.
 * @return {HTMLCollection}  Array-like object of advert elements.
 */
function extractAds(doc) {
    // Google ads have class="ads-ad"
    return doc.getElementsByClassName("ads-ad");
}
/**
 * Extracts the text from the adverts and tokenises it (removes the stop words and stems the remaining words).
 * @param  {HTMLCollection} ads  Array-like object containing advert elements.
 * @return {Array}               Arrays of strings representing individual words from the advert text.
 */
function processAds(ads) {
    var ads_words = [];
    var ad_text;
    for (var ad of ads) {
        // Extract advert text
        ad_text = getAdText(ad);
        // Tokenise advert text (remove stop words and stem the remaining words)
        ad_text = tokeniseText(ad_text);
        ads_words.push(ad_text);
    }
    return ads_words;
}
/**
 * Extracts text of advert elements recursively.
 * @param  {HTMLElement} ad  Advert element.
 * @return {String}          Advert text.
 */
function getAdText(ad) {
    var text = '';
    var ignore_nodes = ad.className == "_lBb"       // Ad notice
                    || ad.className == "_mB"        // Ad icon
                    || ad.className == "_WGk"       // Ad url
                    || ad.id        == "btn_label"  // Button to change advert label
   
    var num_children = ad.childNodes.length
    
    // Recurse down into inner nodes until a text node is reached
    if (ad.hasChildNodes() && !ignore_nodes) {
        for (var i = 0; i < num_children; i++) {
            text += getAdText(ad.childNodes[i]);
        }
    } else if (ad.nodeType === Node.TEXT_NODE && !ignore_nodes){
        // Append text from node
        text += ad.textContent + ' ';
    }
    return text;
}





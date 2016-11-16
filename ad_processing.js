/* -------------------------- Main functions -------------------------- */
/**
 * Extract the adverts from the results page, classifies them into
 * sensitive or non-sensitive and adds a coloured border accordingly.
 */
/**
 * Extract adverts from the currently loaded page.
 * @return {HTMLCollection}  Array-like object of advert elements.
 */
function extractAds(doc) {
    // Google ads have class="ads-ad"
    return doc.getElementsByClassName("ads-ad");
}
/**
 * Extracts the text from the adverts and tokenizes it.
 * @param  {HTMLCollection} ads  Array-like object containing advert elements.
 * @return {Array}               Arrays of strings representing individual words from the advert text.
 */
function processAds(ads) {
    var ads_ = [];
    var ad_proc;
    for (var ad of ads) {
        // Extract advert text
        ad_proc = getAdText(ad);
        // Tokenise advert text (remove stop words and stem words)
        ad_proc = tokeniseText(ad_proc);
        ads_.push(ad_proc);
    }
    return ads_;
}
/**
 * Extracts text of advert elements recursively.
 * @param  {HTMLElement} ad  Advert element.
 * @return {String}          Advert text.
 */
function getAdText(ad) {
    var txt = '';
    var ignore_nodes = ad.className == "_lBb"       // Ad notice
                    || ad.className == "_mB"        // Ad icon
                    || ad.className == "_WGk"       // Ad url
                    || ad.id        == "btn_label"  // Button to change advert label
   
    var num_children = ad.childNodes.length
    
    // Recurse down into inner nodes until a text node is reached
    if (ad.hasChildNodes() && !ignore_nodes) {
        for (var i = 0; i < num_children; i++) {
            txt += getAdText(ad.childNodes[i]);
        }
    } else if (ad.nodeType === Node.TEXT_NODE && !ignore_nodes){
        // Append text from node
        txt += ad.textContent + ' ';
    }
    return txt;
}





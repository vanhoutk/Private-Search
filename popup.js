/**
 * Extract the adverts from the results page, classifies them into
 * sensitive or non-sensitive and adds a coloured border accordingly.
 */

/**
 * Extract adverts from the currently loaded page.
 * @return {HTMLCollection}  Array-like object of advert elements.
 */
function extractAds() {
    // Google ads have class="ads-ad"
    return document.getElementsByClassName("ads-ad");
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

    var ignore_nodes = ad.className == "_lBb"     // Ad notice
                    || ad.className == "_mB"      // Ad icon
                    || ad.className == "_WGk";    // Ad url

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

/**
 * Removes stop words from text and stems the remaining words.
 * @param  {String} text  Raw text.
 * @return {Array}        Text without stop words and with stemmed words.
 */
function tokeniseText(text) {
    // TODO: remove numbers
 
    // Remove stop words
    var text_= removeStopWords(text);   // String

    // Stem words
    text_ = stemWords(text_);       // String

    // Split string into individual words
    return text_.split(' ');
}

var stopWords = "a,about,across,above,after,afterwards,again,against,ain,all,almost,alone,along,already,also,although,always,am,among,amongst,amoungst,amount,amp,an,and,another,any,anyhow,anyone,anything,anyway,anywhere,are,aren,around,as,at,back,b,be,became,because,become,becomes,becoming,been,before,beforehand,behind,being,below,beside,besides,between,beyond,bill,both,bottom,but,by,call,can,cannot,cant,co,computer,con,could,couldn,couldnt,cry,d,de,describe,detail,did,didn,didn\'t,do,don\'t,does,doesn,doing,don,done,down,due,during,each,eg,eight,either,eleven,else,elsewhere,em,empty,enough,etc,eu,even,ever,every,everyone,everything,everywhere,except,few,fifteen,fifty,fill,find,fire,first,five,for,former,formerly,forty,found,four,from,front,full,further,get,give,go,had,hadn,has,hasn,hasnt,have,haven,having,he,hence,her,here,hereafter,hereby,herein,hereupon,hers,herself,hi,him,himself,his,how,however,hundred,i,i \'m,ie,if,in,inc,indeed,interest,into,is,isn,it,its,itself,just,keep,last,latter,latterly,least,less,lo,ltd,ll,m,ma,made,many,may,me,meanwhile,might,mill,mine,mightn,more,moreover,most,mostly,move,much,must,mustn,my,myself,name,namely,nbsp,neither,never,needn,nevertheless,next,nine,no,nobody,none,noone,nor,not,nothing,now,nowhere,o,of,off,often,on,once,one,only,onto,or,other,others,otherwise,our,ours,ourselves,out,over,own,part,per,perhaps,please,put,rather,re,s,same,see,seem,seemed,seeming,seems,serious,several,shan,she,should,shouldn,shouldn\'t,show,side,since,sincere,six,sixty,so,some,somehow,someone,something,sometime,sometimes,somewhere,still,such,system,t,take,ten,than,that,the,their,theirs,them,themselves,then,thence,there,thereafter,thereby,therefore,therein,thereupon,these,they,thick,thin,third,this,those,three,through,throughout,thru,thus,to,together,too,top,toward,towards,twelve,twenty,two,un,under,until,up,upon,us,ve,very,via,was,wasn,we,well,were,weren,what,whatever,when,whence,whenever,where,whereafter,whereas,whereby,wherein,whereupon,wherever,whether,which,while,whither,who,whoever,whole,whom,whose,why,will,with,within,without,would,won,wouldn,y,yet,you,your,yours,yourself,yourselves,www,htm,html,com,pfx,forum,aspx,nav,messages,webtag,ab,li,file,localhost,span,price,online,free,official";

/**
 * Removes stop words from text.
 * @param  {String} str  Raw text.
 * @return {String}      Text without stop words.
 */
function removeStopWords(str) {
    var words = new Array();

    str.replace(/\b[\w]+\b/g,
        function(str) {
            if (!isStopWord(str)) {
                words[words.length] = str.trim();
            }
        }
    ); 
    return words.join(' ');
}

/**
 * Verifies whether the input is a stop word.
 * @param  {String}  word  Word to be verified.
 * @return {Boolean}       True if word is a stop word; false otherwise.
 */
function isStopWord(word) {
    var isNumber =  /^\d+$/.test(word);
    var regex = new RegExp("\\b"+word+"\\b","i");
    if (!isNumber && stopWords.search(regex) < 0) {
        return false;
    } else {
        return true;    
    }   
}

/**
 * Stems the words from the text.
 * @param  {Array} ads  Array containing the adverts.
 * @return {Array}      Each element of the array is an array containing the stemmed words from each advert.
 */
function stemWords(text) {

    return text.toLowerCase().split(' ').map(stemmer).join(' ');
}

// TODO: include copyright notice (how?) https://goo.gl/YUQCYg

// Modified from https://github.com/kristopolous/Porter-Stemmer/blob/master/PorterStemmer1980.min.js
var stemmer=function(){function h(){}function i(){}var j={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},k={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""};return function(a,l){var d,b,g,c,f,e;e=l?i:h;if(3>a.length)return a;
g=a.substr(0,1);"y"==g&&(a=g.toUpperCase()+a.substr(1));c=/^(.+?)(ss|i)es$/;b=/^(.+?)([^s])s$/;c.test(a)?(a=a.replace(c,"$1$2"),e("1a",c,a)):b.test(a)&&(a=a.replace(b,"$1$2"),e("1a",b,a));c=/^(.+?)eed$/;b=/^(.+?)(ed|ing)$/;c.test(a)?(b=c.exec(a),c=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,c.test(b[1])&&(c=/.$/,a=a.replace(c,""),e("1b",c,a))):b.test(a)&&(b=b.exec(a),d=b[1],b=/^([^aeiou][^aeiouy]*)?[aeiouy]/,b.test(d)&&(a=d,e("1b",b,a),b=/(at|bl|iz)$/,f=/([^aeiouylsz])\1$/,d=/^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/,
b.test(a)?(a+="e",e("1b",b,a)):f.test(a)?(c=/.$/,a=a.replace(c,""),e("1b",f,a)):d.test(a)&&(a+="e",e("1b",d,a))));c=/^(.*[aeiouy].*)y$/;c.test(a)&&(b=c.exec(a),d=b[1],a=d+"i",e("1c",c,a));c=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;c.test(a)&&(b=c.exec(a),d=b[1],b=b[2],c=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,c.test(d)&&(a=d+j[b],e("2",c,a)));c=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
c.test(a)&&(b=c.exec(a),d=b[1],b=b[2],c=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,c.test(d)&&(a=d+k[b],e("3",c,a)));c=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;b=/^(.+?)(s|t)(ion)$/;c.test(a)?(b=c.exec(a),d=b[1],c=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,c.test(d)&&(a=d,e("4",c,a))):b.test(a)&&(b=b.exec(a),d=b[1]+b[2],b=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,
b.test(d)&&(a=d,e("4",b,a)));c=/^(.+?)e$/;if(c.test(a)&&(b=c.exec(a),d=b[1],c=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,b=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*([aeiouy][aeiou]*)?$/,f=/^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/,c.test(d)||b.test(d)&&!f.test(d)))a=d,e("5",c,b,f,a);c=/ll$/;b=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;c.test(a)&&b.test(a)&&(c=/.$/,a=a.replace(c,""),e("5",
c,b,a));"y"==g&&(a=g.toLowerCase()+a.substr(1));return a}}();

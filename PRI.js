
/**
 * Performs the training part of the application: initializes the variables 
 * that contain the keywords, training data and count matrix.
 * @param  {Boolean} first_training  Indicates if this is the first time training
 *                                   is performed; defaults to true.
 */

function training(first_training = true) {
    (debug>0)&&log("training ...");
    var labels_str = localStorage.getItem("labels");
    var keywords_str = localStorage.getItem("keywords");
    var matrix_str = localStorage.getItem("count_matrix");
    var row_probs_str = localStorage.getItem("row_probs");
    var col_probs_str = localStorage.getItem("col_probs");
    if (!first_training && labels_str!=null && keywords_str!=null && matrix_str!=null && row_probs_str!=null && col_probs_str!=null) {
        // Extract training data from local storage
        labels = deserializeStrArray(labels_str);
        keywords = deserializeStrArray(keywords_str);
        count_matrix = deserializeMatrix(matrix_str);
        (debug>0)&&log("warm start");
        return {'labels':labels, 'keywords':keywords, 'count_matrix':count_matrix, 'row_probs':row_probs, 'col_probs':col_probs};
    }
    // use default training data
    var t0 = performance.now();
    localStorage.setItem("training_data", training_data_str);
    training_data_str = training_data_str;
    var t1 = performance.now();
    profile&&log("init took " + (t1 - t0) + " milliseconds.")
    // Split the training data into individual ads with a label and some text
    training_data = splitTrainingData(training_data_str);
    var t0 = performance.now();
    profile&&log("splitTrainingData took " + (t0 - t1) + " milliseconds.")

    // Create a list of keywords and a dictionary
    var labels=[];
    for (var ad of training_data) {
        labels.push(ad[0]);
    }
    labels = getUniqueWords(labels);
    var t1 = performance.now();
    profile&&log("getUniqueWords took " + (t1 - t0) + " milliseconds.")
    var keywords = buildDictionary(training_data);
    var t0 = performance.now();
    profile&&log("buildDictionary took " + (t0 - t1) + " milliseconds.")

    // Create count matrix
    var count_matrix = createCountMatrix(labels,keywords,training_data);
    var t1 = performance.now();
    profile&&log("createCountMatrix took " + (t1 - t0) + " milliseconds.")

    // Calc row and col frequencies
    var [row_probs, col_probs] = getProbs(count_matrix,labels,keywords);
    var t0 = performance.now();
    profile&&log("getProbs took " + (t0 - t1) + " milliseconds.")
  
    // Save training variables to local storage
    var trained_data = {'labels':labels, 'keywords':keywords, 'count_matrix':count_matrix, 'row_probs':row_probs, 'col_probs':col_probs};
    saveTrainedData(trained_data);
    var t1 = performance.now();
    profile&&log("save took " + (t1 - t0) + " milliseconds.");
    (debug>0)&&log("keywords: "+keywords.length);
    return trained_data;
}

/**
 * Splits the training data into an array of individual adverts.
 * Each advert consists of an array containing a label and some text.
 * @param  {String} training_data  String containing the training data.
 * @return {Array}                 Training data split into individual adverts. 
 */
function splitTrainingData(training_data) {
    // Split adverts (delimited by ';')
    var t1 = performance.now();
    training_data = training_data.split(';').slice(0, -1);  // "slice" removes extra ';' at the end of the string
    var training_data_ = [];
    var t0 = performance.now();
    profile&&log("splitTrainingData split took " + (t0 - t1) + " milliseconds.")
    var t0_sum=0, t1_sum=0;
    for (var i = 0; i < training_data.length; i++) {
        // Separate label and advert text (delimited by '::')
        training_data_[i] = training_data[i].split('::');
        // Tokenise advert text
        var t00 = performance.now();
        training_data_[i][1] = tokeniseText(training_data_[i][1]);
        var t01 = performance.now();
        training_data_[i][1] = (training_data_[i][1]).join(' ');
        var t02 = performance.now();
        t0_sum += t01-t00; t1_sum =t02-t01;
    }
    var t1 = performance.now();
    profile&&log("splitTrainingData loop took " + (t1 - t0) + " milliseconds.")
    profile&&log('broken down as ' + t0_sum+' '+t1_sum)
    return training_data_;
}

function saveTrainedData(trained_data) {
    // Save training variables to local storage
    localStorage.setItem("labels", serializeArray(trained_data.labels));
    localStorage.setItem("keywords", serializeArray(trained_data.keywords));
    localStorage.setItem("count_matrix", serializeMatrix(trained_data.count_matrix));
    localStorage.setItem("row_probs", serializeArray(trained_data.row_probs));
    localStorage.setItem("col_probs", serializeArray(trained_data.col_probs));
}

function addLabel(trained_data, label) {
    var label_index = trained_data.labels.indexOf(label);
    if (label_index >= 0) {
       console.log('WARNING: addLabel called with existing label: '+label);
       return trained_data;      
    }
    // unknown label, add it as a new one
    trained_data.labels.push(label);
    // and expand count_matrix with an extra row
    var len=trained_data.count_matrix.length;
    trained_data.count_matrix[len] = new Array(trained_data.keywords.length);
    trained_data.count_matrix[len].fill(0);
    // update row and col frequencies
    [trained_data.row_probs, trained_data.col_probs] = getProbs(trained_data.count_matrix,trained_data.labels,trained_data.keywords);

    saveTrainedData(trained_data);
    return trained_data;
}
/**
 * Includes and advert in the training data.
 * @param {Array}  ad_txt  Array containing the advert text.
 * @param {String} label   Advert label.
 */
function addTrainingData(trained_data, ad_txt, label) {
    // Add advert to training data
    var ad_data = label + ':: ' + ad_txt.join(' ') + ';';

    var label_index = trained_data.labels.indexOf(label);
    if (label_index < 0) {
       // unknown label
       console.log('ERROR: addTrainingData called with invalid label: '+label);
       return trained_data;      
    }
    // update dictionary of keywords
    (debug>2)&&log(trained_data.keywords);
    (debug>2)&&log(trained_data.keywords.length);
    (debug>0)&&log(ad_txt);
    for (var ad of ad_txt) {
      if (trained_data.keywords.indexOf(ad)<0) {
         trained_data.keywords.push(ad);
         (debug>0)&&log('added '+ad);
      }
    }
    //trained_data.keywords = getUniqueWords(trained_data.keywords,1);
    //console.log(trained_data.keywords.length);

    // update count matrix
    for (var token of ad_txt) {
        var keyword_index = trained_data.keywords.indexOf(token);
        trained_data.count_matrix[label_index][keyword_index]++;
    }

    // update row and col frequencies
    [trained_data.row_probs, trained_data.col_probs] = getProbs(trained_data.count_matrix,trained_data.labels,trained_data.keywords);
 
    // Save training variables to local storage
    saveTrainedData(trained_data);
    return trained_data;
}
/**
 * Creates a list of unique keywords appearing in the adverts.
 * @param  {Array} training_data  Training data.
 * @return {Array}                List of keywords found in training data.
 */
function buildDictionary(training_data) {
    var words = getKeywords(training_data);
    // Remove repeated words
    var keywords = getUniqueWords(words);
    return keywords;
}

/**
 * Creates a count matrix using the training data
 * @param  {Array} labels    List of advert labels.
 * @param  {Array} ad_texts  Training data.
 */
function createCountMatrix(labels,keywords,training_data) {
    // Initialize empty count matrix
    var count_matrix = initMatrix(labels.length, keywords.length);
    // Update count matrix using the training data
    for (var ad of training_data) {
        var label_index = labels.indexOf(ad[0]);
        tokens = ad[1].split(' ');
        // Update count matrix
        for (var token of tokens) {
          var keyword_index = keywords.indexOf(token);
          count_matrix[label_index][keyword_index]++;
        }
    }
    return count_matrix;
}
/**
 * Initializes the count matrix (2d array) and sets all values to 0.
 * @param  {Number} len_labels    Number of labels.
 * @param  {Number} len_keywords  Number of keywords.
 */
function initMatrix(len_labels, len_keywords) {
    // First dimension: labels.
    // Second dimension: keywords.
    var count_matrix = [];
    for (var i = 0; i < len_labels; i++) {
        count_matrix[i] = new Array(len_keywords);
        count_matrix[i].fill(0);
        //for (var j = 0; j < len_keywords; j++) {
        //    count_matrix[i][j] = 0;
        //}
    }
    return count_matrix;
}

/**
 * Gets the sums of the rows of the count matrix.
 * @return {Array}  Row sums.
 */
function getRowSums(count_matrix) {
	var row_sums = [], sum;
	var n_rows = count_matrix.length; //labels.length,
  var n_cols = count_matrix[0].length; //keywords.length;
	for (var i = 0; i < n_rows; i++) {
     sum = 0;
     for (var j = 0; j < n_cols; j++) {
        sum += count_matrix[i][j];
     }
     if (sum==0) sum=1; // avoid divide by zero
		 row_sums.push(sum);
	}
	return row_sums;
}

/**
 * Gets the sums of the columns of the count matrix.
 * @return {Array}  Column sums.
 */
function getColSums(count_matrix) {
	var col_sums = [], sum;
	//var n_rows = labels.length, n_cols = keywords.length;
	var n_rows = count_matrix.length; //labels.length,
  var n_cols = count_matrix[0].length; //keywords.length;
	for (var i = 0; i < n_cols; i++) {
		sum = 0;
		for (var j = 0; j < n_rows; j++) {
			sum += count_matrix[j][i];
		}
		col_sums.push(sum);
	}
	return col_sums;
}


/**
 * Calculates the PRI estimator for the advert.
 * @param  {Array} ad         Advert text
 * @param  {Array} row_probs  Row probabilities (2d Array).
 * @param  {Array} col_probs  Column probabilities.
 * @return {Array}            PRI estimator for all the labels.
 */
function getPRI(trained_data, ad) {
	// Get the frequency of the words in the advert appearing in the training data
	var word_freq = getWordFreq(trained_data.keywords, ad);
	
	var pri = [];
	var len_labels = trained_data.labels.length, len_words = word_freq.length;
	// Calculate the PRI for each label
	for (var i = 0; i < len_labels; i++) {
		var sum = 0;
		for (var j = 0; j < len_words; j++) {
			sum += (word_freq[j] * trained_data.row_probs[i][j]) / trained_data.col_probs[j];
		}
		pri.push(sum);
	}
	(debug>2)&&log("PRI:");(debug>2)&&log(pri);
	return pri;
}

function getProbs(count_matrix, labels, keywords) {
	// Get the sums of the rows and columns of the count matrix
	var row_sums = getRowSums(count_matrix);
	var col_sums = getColSums(count_matrix);
  (debug>2)&&log('row'+row_sums); (debug>2)&&log('col'+col_sums);
	var len_labels = labels.length, len_kw = keywords.length;
	/* --- Row probabilities --- */
	// Create a data structure similar to the count matrix
  var row_probs = createEmptyMatrix(len_labels, len_kw);
	// Divide the rows of the count matrix by row sums
	for (var i = 0; i < len_labels; i++) {
		for (var j = 0; j < len_kw; j++) {
			row_probs[i][j] = count_matrix[i][j] / row_sums[i];
		}
	}
	
	/* --- Column probabilities --- */
	var col_probs = [];
	// Calculate total sum
	var total_sum = col_sums.reduce((a,b) => a + b, 0);
	// Divide column sums by total sum
	for (var i = 0; i < len_kw; i++) {
		col_probs.push(col_sums[i]/total_sum);
	}
	return [row_probs, col_probs];
}
/**
 * Creates an empty matrix.
 * @param  {Number} n_rows  Number of rows.
 * @param  {Number} n_cols  Number of columns.
 * @return {Array}          2d Array representing empty matrix (n_rows x n_cols).
 */
function createEmptyMatrix(n_rows, n_cols) {
    var matrix = [];
    for (var i = 0; i < n_rows; i++) {
        matrix[i] = new Array(n_cols);
    }
    return matrix;
}

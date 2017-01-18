
/**
 * Performs the training part of the application: initializes the variables 
 * that contain the keywords, training data and count matrix.
 * @param  {Boolean} first_training  Indicates if this is the first time training
 *                                   is performed; defaults to true.
 */

function training(first_training = true)
{
    (debug > 0) && log("training()...");

    // Get data from local storage
    var labels_str = localStorage.getItem("labels");
    var keywords_str = localStorage.getItem("keywords");
    var matrix_str = localStorage.getItem("count_matrix");
    var row_probs_str = localStorage.getItem("row_probs");
    var col_probs_str = localStorage.getItem("col_probs");


    if (!first_training && labels_str != null && keywords_str != null && matrix_str != null && row_probs_str != null && col_probs_str != null) {
        // Extract training data from local storage
        labels = deserializeStrArray(labels_str); // labels is a 1d Array
        keywords = deserializeStrArray(keywords_str); // keywords is a 1d array
        count_matrix = deserializeMatrix(matrix_str); // count_matrix is a 2d array

        (debug > 0) && log("training(): not first training & data exists");

        // TODO: row_probs and col_probs should probably be set?
        return {'labels':labels, 'keywords':keywords, 'count_matrix':count_matrix, 'row_probs':row_probs, 'col_probs':col_probs};
    }

    var t0 = performance.now();

    // Use the default training data in training_data.js
    localStorage.setItem("training_data", training_data_str); // training_data_str is in training_data.js
    training_data_str = training_data_str;

    var t1 = performance.now();
    profile && log("init took " + (t1 - t0) + " milliseconds.") // profile is a variable in background.js for printing the performance timing.

    // Split the training data into an array of individual ads with a label (array[i][0]) and some text (array[i][1])
    training_data = splitTrainingData(training_data_str);

    var t0 = performance.now();
    profile && log("splitTrainingData took " + (t0 - t1) + " milliseconds.")

    // Create a list of labels and a dictionary
    var labels = [];

    // Push all of the labels
    for (var ad of training_data) {
        labels.push(ad[0]);
    }

    // Remove duplicate labels
    labels = getUniqueWords(labels);

    var t1 = performance.now();
    profile && log("getUniqueWords took " + (t1 - t0) + " milliseconds.")

    // Build a dictionary of keywords from the ad text (array[i][1])
    var keywords = buildDictionary(training_data);

    var t0 = performance.now();
    profile && log("buildDictionary took " + (t0 - t1) + " milliseconds.")

    // Create count matrix
    var count_matrix = createCountMatrix(labels,keywords,training_data);

    var t1 = performance.now();
    profile && log("createCountMatrix took " + (t1 - t0) + " milliseconds.")

    // Calculate row and column frequencies
    var [row_probs, col_probs] = getProbs(count_matrix,labels,keywords);

    var t0 = performance.now();
    profile && log("getProbs took " + (t0 - t1) + " milliseconds.")
  
    // Save training variables to local storage
    var trained_data = {'labels':labels, 'keywords':keywords, 'count_matrix':count_matrix, 'row_probs':row_probs, 'col_probs':col_probs};
    saveTrainedData(trained_data);

    var t1 = performance.now();
    profile && log("save took " + (t1 - t0) + " milliseconds.");

    (debug > 0) && log("training(): Number of keywords = " + keywords.length);

    return trained_data;
}

/**
 * Splits the training data into an array of individual adverts.
 * Each advert consists of an array containing a label and some text.
 * @param  {String} training_data  String containing the training data.
 * @return {Array}                 Training data split into individual adverts. 
 */
function splitTrainingData(training_data)
{
    var t1 = performance.now();

    // Split adverts (delimited by ';')
    training_data = training_data.split(';').slice(0, -1);  // "slice" removes the extra ';' at the end of the string
    var split_training_data = [];

    var t0 = performance.now();
    profile && log("splitTrainingData split took " + (t0 - t1) + " milliseconds.")
    var t0_sum=0, t1_sum=0;

    for (var i = 0; i < training_data.length; i++)
    {
        // Separate label and advert text (delimited by '::')
        split_training_data[i] = training_data[i].split('::');

        var t00 = performance.now();

        // Tokenise the advert text (2d array to 3d)
        split_training_data[i][1] = tokeniseText(split_training_data[i][1]);

        var t01 = performance.now();

        // Join the tokenised advert test (3d array to 2d)
        split_training_data[i][1] = (split_training_data[i][1]).join(' ');

        var t02 = performance.now();
        t0_sum += t01 - t00; t1_sum = t02 - t01;
    }

    var t1 = performance.now();
    profile && log("splitTrainingData loop took " + (t1 - t0) + " milliseconds.")
    profile && log('broken down as ' + t0_sum + ' ' + t1_sum)

    return split_training_data;
}

function saveTrainedData(trained_data) {
    // Save training variables to local storage
    localStorage.setItem("labels", serializeArray(trained_data.labels));
    localStorage.setItem("keywords", serializeArray(trained_data.keywords));
    localStorage.setItem("count_matrix", serializeMatrix(trained_data.count_matrix));
    localStorage.setItem("row_probs", serializeArray(trained_data.row_probs));
    localStorage.setItem("col_probs", serializeArray(trained_data.col_probs));
}

/**
 * Add a new label to the Trained Data
 * @param trained_data
 * @param {String} label    Label
 */
function addLabel(trained_data, label)
{
    var label_index = trained_data.labels.indexOf(label);
    if (label_index >= 0) {
       (debug > 0) && log('WARNING: addLabel() called with existing label = ' + label);
       return trained_data;      
    }

    // Unknown label, add it as a new one
    trained_data.labels.push(label);

    // Expand the count_matrix with an extra row, fill each column of that row with 0s
    var row_length = trained_data.count_matrix.length;
    trained_data.count_matrix[row_length] = new Array(trained_data.keywords.length);
    trained_data.count_matrix[row_length].fill(0);

    // Update the row and column frequencies
    [trained_data.row_probs, trained_data.col_probs] = getProbs(trained_data.count_matrix, trained_data.labels, trained_data.keywords);

    saveTrainedData(trained_data);
    return trained_data;
}

/**
 * Includes and advert in the training data.
 * @param {Array}  ad_text  Array containing the advert text.
 * @param {String} label   Advert label.
 */
function addTrainingData(trained_data, ad_text, label) {

    // Add advert to training data
    var ad_data = label + ':: ' + ad_text.join(' ') + ';';

    // Confirm that the label already exists
    var label_index = trained_data.labels.indexOf(label);
    if (label_index < 0) {
       // Unknown label
       log('ERROR: addTrainingData() called with invalid label = '+label);
       return trained_data;      
    }

    (debug > 2) && log(trained_data.keywords);
    (debug > 2) && log(trained_data.keywords.length);
    (debug > 0) && log(ad_text);

    // Update dictionary of keywords
    for (var keyword of ad_text)
    {
        // Check if it's a new keyword
        if (trained_data.keywords.indexOf(keyword) < 0)
        {
            trained_data.keywords.push(keyword);

            (debug > 0) && log('addTrainingData(): Added new keyword = ' + keyword);

            // Update the count matrix with a new column for this keyword
            var j = trained_data.keywords.length - 1;
            for (var i=0; i < trained_data.labels.length; i++)
            {
                trained_data.count_matrix[i][j]=0;
            }
        }
    }

    // Update the count_matrix to reflect the keywords within the ad text
    for (var keyword of ad_text) {
        var keyword_index = trained_data.keywords.indexOf(keyword);
        trained_data.count_matrix[label_index][keyword_index]++;
    }

    // Update the row and column frequencies
    [trained_data.row_probs, trained_data.col_probs] = getProbs(trained_data.count_matrix, trained_data.labels, trained_data.keywords);
 
    // Save training variables to local storage
    saveTrainedData(trained_data);
    return trained_data;
}

/**
 * Creates a list of unique keywords appearing in the adverts. (training_data.js string)
 * @param  {Array} training_data  Training data.
 * @return {Array}                List of keywords found in training data.
 */
function buildDictionary(training_data)
{
    // Get the keywords from the training data
    var words = getKeywords(training_data);
    // Remove repeated words
    var keywords = getUniqueWords(words);
    return keywords;
}

/**
 * Creates a count matrix using the training data with (number of labels rows x number of keywords columns)
 * @param  {Array} labels    List of advert labels.
 * @param  {Array} ad_texts  Training data.
 */
function createCountMatrix(labels, keywords, training_data) {

    // Initialize empty count matrix
    var count_matrix = initMatrix(labels.length, keywords.length);

    // Update count matrix using the training data
    for (var ad of training_data)
    {
        var label_index = labels.indexOf(ad[0]);
        keywords = ad[1].split(' ');

        // Update the count matrix
        for (var keyword of keywords) {
          var keyword_index = keywords.indexOf(keyword);
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
    for (var i = 0; i < len_labels; i++)
    {
        count_matrix[i] = new Array(len_keywords);
        count_matrix[i].fill(0);
    }
    return count_matrix;
}

/**
 * Gets the sums of the rows of the count matrix. (Sums up all of the values in each column of the row, i.e. total keywords for that label)
 * @return {Array}  Row sums.
 */
function getRowSums(count_matrix)
{
	var row_sums = [], sum;
	var n_rows = count_matrix.length; //labels.length,
    var n_cols = count_matrix[0].length; //keywords.length;
	for (var i = 0; i < n_rows; i++)
	{
        sum = 0;
        for (var j = 0; j < n_cols; j++) {
            sum += count_matrix[i][j];
        }
        if (sum == 0) {sum = 1;} // avoid divide by zero
        row_sums.push(sum);
    }
	return row_sums;
}

/**
 * Gets the sums of the columns of the count matrix. (Sums up all of the values in each row of a column, i.e. the total time a keyword appears across all labels)
 * @return {Array}  Column sums.
 */
function getColSums(count_matrix)
{
	var col_sums = [], sum;
	var n_rows = count_matrix.length; //labels.length,
    var n_cols = count_matrix[0].length; //keywords.length;
	for (var i = 0; i < n_cols; i++)
	{
		sum = 0;
		for (var j = 0; j < n_rows; j++)
		{
			sum += count_matrix[j][i];
		}
        // TODO: I think this sum == 0 line can be removed, as there's no situation where col_sums is used for division.
        // if (sum == 0) {sum = 1;} // avoid divide by zero 
		col_sums.push(sum);
	}
	return col_sums;
}

// TODO: Change this to PRI+
/**
 * Calculates the PRI estimator for the advert.
 * @param  {Array} ad         Advert text
 * @param  {Array} row_probs  Row probabilities (2d array)
 * @param  {Array} col_probs  Column probabilities 
 * @return {Array}            PRI estimator for all the labels.
 */
function getPRI(trained_data, ad)
{
	// Get the frequency of the words in the advert appearing in the training data
    // word_freq is an array of [number of times a keyword from the ad appears in the keywords/number of times any keyword from the ad appears in the keywords]
	var word_freq = getWordFreq(trained_data.keywords, ad);

	var pri = [];

	var labels_length = trained_data.labels.length;
    var words_length = word_freq.length; // Word_freq.length = trained_data.keywords.length
	// Calculate the PRI for each label
	for (var i = 0; i < labels_length; i++)
	{
		var sum = 0;
		for (var j = 0; j < words_length; j++)
		{
			sum += (word_freq[j] * trained_data.row_probs[i][j]) / trained_data.col_probs[j];
		}
        //sum = Math.round(sum * 100000) / 100000; // Limit the sum to 5 decimal places.
        // PRI(label, user{probe} interaction) = SUM_forall keywords([relative frequency(RF) of the words in the advert] * [RF of words in ads in training data associated with label] / [RF of words in all ads in training data])
		pri.push(sum);
	}

	(debug > 2) && log("getPRI(): PRI = ");
	(debug > 2) && log(pri);

	return pri;
}

function getProbs(count_matrix, labels, keywords)
{
	// Get the sums of the rows and columns of the count matrix
	var row_sums = getRowSums(count_matrix);
	var col_sums = getColSums(count_matrix);

	(debug > 2) && log('getProbs(): Row sums = ' + row_sums);
	(debug > 2) && log('getProbs(): Column sums = ' + col_sums);

	var labels_length = labels.length, keywords_length = keywords.length;

	/* --- Row probabilities --- */
	// Create a data structure similar to the count matrix
    var row_probs = createEmptyMatrix(labels_length, keywords_length);
	// Divide the rows of the count matrix by row sums
	for (var i = 0; i < labels_length; i++)
	{
		for (var j = 0; j < keywords_length; j++)
		{
			row_probs[i][j] = count_matrix[i][j] / row_sums[i];
		}
	}

	/* --- Column probabilities --- */
	var col_probs = [];
	// Calculate total sum
	var total_sum = 0;
    for (var i = 0; i < keywords_length; i++)
    {
        total_sum += col_sums[i];
    }

    if (total_sum == 0) {total_sum = 1;} // Avoid divide by 0
	// Divide column sums by total sum
	for (var i = 0; i < keywords_length; i++)
	{
		col_probs.push(col_sums[i] / total_sum);
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

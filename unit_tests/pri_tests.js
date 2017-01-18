QUnit.test("PRI Tests", function(assert) {
	// | initMatrix()
	var expected_matrix = [
  		[0, 0, 0, 0],
  		[0, 0, 0, 0],
  		[0, 0, 0, 0]
	];
	var zero_count_matrix = initMatrix(3, 4);
	assert.deepEqual(zero_count_matrix, expected_matrix, "initMatrix()");


	// | getRowSums() & getColSums()
	// Testing with a filled matrix
	var count_matrix = [
  		[1, 2, 3, 4],
  		[2, 2, 2, 2],
  		[0, 1, 0, 1]
	];
	var expected_row_sums = [10, 8, 2];
	var expected_col_sums = [3, 5, 5, 7];
	assert.deepEqual(getRowSums(count_matrix), expected_row_sums, "getRowSums()");
	assert.deepEqual(getColSums(count_matrix), expected_col_sums, "getColSums()");

	// Testing with a 0 matrix to test all conditional branches
	var count_matrix_with_zeros = [
			[0, 0, 0, 0],
  		[0, 2, 2, 2],
  		[0, 1, 0, 1]
	];

	var expected_row_sums_zeros = [1, 6, 2];
	var expected_col_sums_zeros = [1, 3, 2, 3];
	assert.deepEqual(getRowSums(count_matrix_with_zeros), expected_row_sums_zeros, "getRowSums() - zero condition");
	assert.deepEqual(getColSums(count_matrix_with_zeros), expected_col_sums_zeros, "getColSums() - zero condition");


	// | createEmptyMatrix()
	var expected_empty_matrix = new Array(5);
	for(var i = 0; i < 5; i++)
	{
		expected_empty_matrix[i] = new Array(4);
	}

	var empty_matrix = createEmptyMatrix(5, 4);
	assert.deepEqual(empty_matrix, expected_empty_matrix, "createEmptyMatrix()");

	

	// | getProbs()
	// Testing with the previous count_matrix

	debug = 0; // Needs to be assigned here as the background.js is not included in the html

	var expected_row_probs = [
		[0.1, 0.2, 0.3, 0.4],
		[0.25, 0.25, 0.25, 0.25],
		[0, 0.5, 0, 0.5]
	];

	var expected_col_probs = [0.15, 0.25, 0.25, 0.35];
	var expected_probs = [expected_row_probs, expected_col_probs];
	var labels = ["label1", "label2", "label3"];
	var keywords = ["keyword1", "keyword2", "keyword3", "keyword4"];
	assert.deepEqual(getProbs(count_matrix, labels, keywords), expected_probs, "getProbs()"); //deepEqual for multi-dimensional array

	// Testing with an zero-matrix to test all conditional branches

	/*var expected_col_probs_zeros = [0.25, 0.25, 0.25, 0.25];
	var expected_row_probs_zeros = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	];
	var expected_probs_zeros = [expected_row_probs_zeros, expected_col_probs_zeros];
	assert.deepEqual(getProbs(zero_count_matrix, labels, keywords), expected_probs_zeros, "getProbs() - zero condition");*/

	// Test the getPRI function
	

	// Test the buildDictionary function
	var training_data = [
		['label1', 'word1 word2 word3 word4 word5 word6 word2 word3 word4 word6'],
		['label2', 'word3 word4 word5 word6 word7 word8']
	]
  var dictionary = buildDictionary(training_data);
  var expected_dictionary = ['word1', 'word2', 'word3', 'word4', 'word5', 'word6', 'word7', 'word8']

  assert.deepEqual(dictionary, expected_dictionary, "buildDictionary()");

	// Test the addTrainingData function


	// Test the addLabel function
	var trained_data = {
		'labels':labels, 
		'keywords':keywords, 
		'count_matrix':count_matrix, 
		'row_probs':expected_row_probs, 
		'col_probs':expected_col_probs
	};

	var expected_count_matrix = [
  		[1, 2, 3, 4],
  		[2, 2, 2, 2],
  		[0, 1, 0, 1],
  		[0, 0, 0, 0]
	];

	var expected_labels = ["label1", "label2", "label3", "label4"];

	[expected_row_probs_2, expected_col_probs_2] = getProbs(expected_count_matrix, expected_labels, keywords);

	var expected_trained_data = {
		'labels':expected_labels, 
		'keywords':keywords, 
		'count_matrix':expected_count_matrix, 
		'row_probs':expected_row_probs_2, 
		'col_probs':expected_col_probs_2
	};

	assert.deepEqual(addLabel(trained_data, "label4"), expected_trained_data, "addLabel()")

	// Test the splitTrainingData function

	profile = 0;

	var training_data_string = 'label1:: wordA wordB wordC wordD wordE wordF wordB wordC wordD wordF;'
	+ 'label2:: wordC wordD wordE wordF wordG wordH;';

	var expected_split_training_data = [
		['label1', 'worda wordb wordc wordd word wordf wordb wordc wordd wordf'],
		['label2', 'wordc wordd word wordf wordg wordh']
	]

	assert.deepEqual(splitTrainingData(training_data_string), expected_split_training_data, "splitTrainingData()");


	// Test the training function
});


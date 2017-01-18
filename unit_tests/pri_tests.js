QUnit.test("PRI Tests", function(assert) {
	
	// | initMatrix()
	var initMatrix_expected = [
  		[0, 0, 0, 0],
  		[0, 0, 0, 0],
  		[0, 0, 0, 0]
	];
	assert.deepEqual(initMatrix(3, 4), initMatrix_expected, "initMatrix()");


	// | getRowSums() & getColSums()
	// Testing with a filled matrix
	var getSums_count_matrix = [
  		[1, 2, 3, 4],
  		[2, 2, 2, 2],
  		[0, 1, 0, 1]
	];
	var getRowSums_expected = [10, 8, 2];
	var getColSums_expected = [3, 5, 5, 7];
	assert.deepEqual(getRowSums(getSums_count_matrix), getRowSums_expected, "getRowSums()");
	assert.deepEqual(getColSums(getSums_count_matrix), getColSums_expected, "getColSums()");

	// Testing with a 0 matrix to test all conditional branches
	var getSums_count_matrix_zeros = [
		[0, 0, 0, 0],
  		[0, 2, 2, 2],
  		[0, 1, 0, 1]
	];

	var getRowSums_expected_zeros = [1, 6, 2];
	assert.deepEqual(getRowSums(getSums_count_matrix_zeros), getRowSums_expected_zeros, "getRowSums() - zero condition");
	// Removed as there's no longer a conditional branch in getColSums()
	//var expected_col_sums_zeros = [0, 3, 2, 3];
	//assert.deepEqual(getColSums(count_matrix_with_zeros), expected_col_sums_zeros, "getColSums() - zero condition");


	// | createEmptyMatrix()
	var createEmptyMatrix_expected = new Array(5);
	for(var i = 0; i < 5; i++)
	{
		createEmptyMatrix_expected[i] = new Array(4);
	}

	assert.deepEqual(createEmptyMatrix(5, 4), createEmptyMatrix_expected, "createEmptyMatrix()");
	

	// | getProbs()
	debug = 0; // Needs to be assigned here as the background.js is not included in the html

	var getProbs_count_matrix = [
  		[1, 2, 3, 4],
  		[2, 2, 2, 2],
  		[0, 1, 0, 1]
	];

	var getProbs_row_probs_expected = [
		[0.1, 0.2, 0.3, 0.4],
		[0.25, 0.25, 0.25, 0.25],
		[0, 0.5, 0, 0.5]
	];

	var getProbs_col_probs_expected = [0.15, 0.25, 0.25, 0.35];
	var getProbs_expected = [getProbs_row_probs_expected, getProbs_col_probs_expected];
	var getProbs_labels = ["label1", "label2", "label3"];
	var getProbs_keywords = ["keyword1", "keyword2", "keyword3", "keyword4"];
	assert.deepEqual(getProbs(getProbs_count_matrix, getProbs_labels, getProbs_keywords), getProbs_expected, "getProbs()");

	// Testing with a zero-matrix to test all conditional branches

	var getProbs_col_probs_expected_zeros = [0, 0, 0, 0];
	var getProbs_row_probs_expected_zeros = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	];
	var getProbs_expected_zeros = [getProbs_row_probs_expected_zeros, getProbs_col_probs_expected_zeros];
	assert.deepEqual(getProbs(initMatrix(3, 4), getProbs_labels, getProbs_keywords), getProbs_expected_zeros, "getProbs() - zero condition");


	// | getPRI()
	var getPRI_labels = ['label1', 'label2', 'label3'];
	var getPRI_keywords = ['keyworda', 'keywordb', 'keywordc', 'keywordd'];

	var getPRI_count_matrix = [
  		[1, 2, 3, 4],
  		[2, 2, 2, 2],
  		[0, 1, 0, 1]
	];

	var getPRI_row_probs_expected = [
		[0.1, 0.2, 0.3, 0.4],
		[0.25, 0.25, 0.25, 0.25],
		[0, 0.5, 0, 0.5]
	];

	var getPRI_col_probs_expected = [0.15, 0.25, 0.25, 0.35];

	var getPRI_trained_data = {
		'labels': getPRI_labels, 
		'keywords': getPRI_keywords, 
		'count_matrix':getPRI_count_matrix, 
		'row_probs':getPRI_row_probs_expected, 
		'col_probs':getPRI_col_probs_expected
	};

	var getPRI_ad_text = ['keyworda', 'keyworda', 'keyworda', 'keywordb', 'key', 'word', 'name'];

	var getPRI_expected = [
		0.7, // Label1
		1.5, // Label2
		0.5  // Label3
	];	

	assert.deepEqual(getPRI(getPRI_trained_data, getPRI_ad_text), getPRI_expected, "getPRI()");


	// | buildDictionary()
	var buildDictionary_training_data = [
		['label1', 'word1 word2 word3 word4 word5 word6 word2 word3 word4 word6'],
		['label2', 'word3 word4 word5 word6 word7 word8']
	]

	var buildDictionary_expected = ['word1', 'word2', 'word3', 'word4', 'word5', 'word6', 'word7', 'word8']

	assert.deepEqual(buildDictionary(buildDictionary_training_data), buildDictionary_expected, "buildDictionary()");


	// | addTrainingData() - Three different conditional branches
	// Testing with an invalid label
	var addTrainingData_labels = ['label1', 'label2', 'label3'];
	var addTrainingData_keywords = ['keyworda', 'keywordb', 'keywordc', 'keywordd'];
	var addTrainingData_ad_text = ['invalid'];
	
	var addTrainingData_count_matrix = [
  		[1, 2, 3, 4],
  		[2, 2, 2, 2],
  		[0, 1, 0, 1]
	];
	
	var addTrainingData_row_probs = [
		[0.1, 0.2, 0.3, 0.4],
		[0.25, 0.25, 0.25, 0.25],
		[0, 0.5, 0, 0.5]
	];

	var addTrainingData_col_probs = [0.15, 0.25, 0.25, 0.35];
	
	var addTrainingData_trained_data = {
		'labels': addTrainingData_labels, 
		'keywords': addTrainingData_keywords, 
		'count_matrix': addTrainingData_count_matrix, 
		'row_probs': addTrainingData_row_probs, 
		'col_probs': addTrainingData_col_probs
	};

	assert.deepEqual(addTrainingData(addTrainingData_trained_data, addTrainingData_ad_text, "NotALabel"), addTrainingData_trained_data, "addTrainingData() - Invalid Label");

	// Testing with no new keywords
	addTrainingData_ad_text = ['keyworda', 'keyworda', 'keywordd', 'keywordc'];

	addTrainingData_count_matrix = [
  		[3, 2, 4, 5],
  		[2, 2, 2, 2],
  		[0, 1, 0, 1]
	];

	[addTrainingData_row_probs, addTrainingData_col_probs] = getProbs(addTrainingData_count_matrix, addTrainingData_labels, addTrainingData_keywords);

	var addTrainingData_expected = {
		'labels': addTrainingData_labels, 
		'keywords': addTrainingData_keywords, 
		'count_matrix': addTrainingData_count_matrix, 
		'row_probs': addTrainingData_row_probs, 
		'col_probs': addTrainingData_col_probs
	};

	assert.deepEqual(addTrainingData(addTrainingData_trained_data, addTrainingData_ad_text, "label1"), addTrainingData_expected, "addTrainingData() - No new keywords");

	// Testing with new keywords
	addTrainingData_ad_text = ['key', 'word', 'key', 'word', 'name'];

	var addTrainingData_keywords_new = ['keyworda', 'keywordb', 'keywordc', 'keywordd', 'key', 'word', 'name'];

	var addTrainingData_count_matrix_new = [
  		[3, 2, 4, 5, 2, 2, 1],
  		[2, 2, 2, 2, 0, 0, 0],
  		[0, 1, 0, 1, 0, 0, 0]
	];

	[addTrainingData_row_probs_new, addTrainingData_col_probs_new] = getProbs(addTrainingData_count_matrix_new, addTrainingData_labels, addTrainingData_keywords_new);

	var addTrainingData_expected_new = {
		'labels': addTrainingData_labels, 
		'keywords': addTrainingData_keywords_new, 
		'count_matrix': addTrainingData_count_matrix_new, 
		'row_probs': addTrainingData_row_probs_new, 
		'col_probs': addTrainingData_col_probs_new
	};
	assert.deepEqual(addTrainingData(addTrainingData_trained_data, addTrainingData_ad_text, "label1"), addTrainingData_expected_new, "addTrainingData() - New keywords");


	// | addLabel()
	// Testing with a new label and changed training data
	var addLabel_labels = ["label1", "label2", "label3"];
	var addLabel_keywords = ["keyworda", "keywordb", "keywordc", "keywordd"];

	var addLabel_count_matrix = [
  		[1, 2, 3, 4],
  		[2, 2, 2, 2],
  		[0, 1, 0, 1]
	];

	[addLabel_row_probs, addLabel_col_probs] = getProbs(addLabel_count_matrix, addLabel_labels, addLabel_keywords);

	var addLabel_trained_data = {
		'labels':addLabel_labels, 
		'keywords':addLabel_keywords, 
		'count_matrix':addLabel_count_matrix, 
		'row_probs':addLabel_row_probs, 
		'col_probs':addLabel_col_probs
	};

	var addLabel_expected_labels = ["label1", "label2", "label3", "label4"];
	var addLabel_expected_count_matrix = [
  		[1, 2, 3, 4],
  		[2, 2, 2, 2],
  		[0, 1, 0, 1],
  		[0, 0, 0, 0]
	];

	
	[addLabel_expected_row_probs, addLabel_expected_col_probs] = getProbs(addLabel_expected_count_matrix, addLabel_expected_labels, addLabel_keywords);

	var addLabel_expected_trained_data = {
		'labels':addLabel_expected_labels, 
		'keywords':addLabel_keywords, 
		'count_matrix':addLabel_expected_count_matrix, 
		'row_probs':addLabel_expected_row_probs, 
		'col_probs':addLabel_expected_col_probs
	};

	assert.deepEqual(addLabel(addLabel_trained_data, "label4"), addLabel_expected_trained_data, "addLabel() - new label");

	// Testing with an existing label
	assert.deepEqual(addLabel(addLabel_trained_data, "label1"), addLabel_trained_data, "addLabel() - existing label");


	// | splitTrainingData()

	profile = 0;

	var splitTrainingData_string = 'label1:: wordA wordB wordC wordD wordE wordF wordB wordC wordD wordF;'
	+ 'label2:: wordC wordD wordE wordF wordG wordH;';

	var splitTrainingData_expected = [
		['label1', 'worda wordb wordc wordd word wordf wordb wordc wordd wordf'],
		['label2', 'wordc wordd word wordf wordg wordh']
	]

	assert.deepEqual(splitTrainingData(splitTrainingData_string), splitTrainingData_expected, "splitTrainingData()");


	// | createCountMatrix()
	var createCountMatrix_string = 'label1:: wordA wordB wordC wordD wordE wordF wordB wordC wordD wordF;'
	+ 'label2:: wordC wordD wordE wordF wordG wordH;';

	var createCountMatrix_labels = ['label1', 'label2'];
	var createCountMatrix_keywords = ['word', 'worda', 'wordb', 'wordc', 'wordd', 'wordf', 'wordg', 'wordh'];
	var createCountMatrix_training_data = splitTrainingData(createCountMatrix_string);

	var createCountMatrix_expected = [
		[1, 1, 2, 2, 2, 2, 0, 0],
		[1, 0, 0, 1, 1, 1, 1, 1]
	];

	assert.deepEqual(createCountMatrix(createCountMatrix_labels, createCountMatrix_keywords, createCountMatrix_training_data), createCountMatrix_expected, "createCountMatrix()");


	// | training()
	training_data_str = 'label1:: wordA wordB wordC wordD wordE wordF wordB wordC wordD wordF;'
	+ 'label2:: wordC wordD wordE wordF wordG wordH;';

	var training_labels = ['label1', 'label2'];
	var training_keywords = ['word', 'worda', 'wordb', 'wordc', 'wordd', 'wordf', 'wordg', 'wordh'];

	var training_count_matrix = [
		[1, 1, 2, 2, 2, 2, 0, 0],
		[1, 0, 0, 1, 1, 1, 1, 1]
	];

	var training_row_probs, training_col_probs;

	[training_row_probs, training_col_probs] = getProbs(training_count_matrix, training_labels, training_keywords);

	var training_expected = {
		'labels': training_labels, 
		'keywords': training_keywords, 
		'count_matrix': training_count_matrix, 
		'row_probs': training_row_probs, 
		'col_probs': training_col_probs
	};

	assert.deepEqual(training(), training_expected, "training()");
});


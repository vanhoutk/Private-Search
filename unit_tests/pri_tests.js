QUnit.test("PRI Tests", function(assert) {
	// Test the initMatrix function
	var expected_matrix = [
  		[0, 0, 0, 0],
  		[0, 0, 0, 0],
  		[0, 0, 0, 0]
	];
	var zero_count_matrix = initMatrix(3, 4);
	assert.deepEqual(zero_count_matrix, expected_matrix, "initMatrix()");

	// Test the getRowSums and getColSums functions
	var count_matrix = [
  		[1, 2, 3, 4],
  		[2, 2, 2, 2],
  		[0, 1, 0, 1]
	];
	var expected_row_sums = [10, 8, 2];
	var expected_col_sums = [3, 5, 5, 7];
	assert.deepEqual(getRowSums(count_matrix), expected_row_sums, "getRowSums()");
	assert.deepEqual(getColSums(count_matrix), expected_col_sums, "getColSums()");

	// Test the createEmptyMatrix function
	var expected_empty_matrix = new Array(5);
	for(var i = 0; i < 5; i++)
	{
		expected_empty_matrix[i] = new Array(4);
	}

	var empty_matrix = createEmptyMatrix(5, 4);
	assert.deepEqual(empty_matrix, expected_empty_matrix, "createEmptyMatrix()");

	debug = 0;

	// Test the getProbs function
	var expected_row_probs = [
		[0.1, 0.2, 0.3, 0.4],
		[0.25, 0.25, 0.25, 0.25],
		[0, 0.5, 0, 0.5]
	];

	var expected_col_probs = [0.15, 0.25, 0.25, 0.35];
	var expected_probs = [expected_row_probs, expected_col_probs];
	var labels = ["label1", "label2", "label3"];
	var keywords = ["keyword1", "keyword2", "keyword3", "keyword4"];
	assert.deepEqual(getProbs(count_matrix, labels, keywords), expected_probs, "getProbs()");

	// Test the getPRI function
	// Test the buildDictionary function
	// Test the addTrainingData function
	// Test the addLabel function
	// Test the splitTrainingData function
	// Test the training function
});


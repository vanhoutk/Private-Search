QUnit.test("Serialize Tests", function(assert) {

	// | serializeMatrix()
	var serialize_matrix = [
		[1, 2, 3],
		[4, 5, 6]
	];

	var serialize_matrix_expected = "1,2,3;4,5,6";

	assert.deepEqual(serializeMatrix(serialize_matrix), serialize_matrix_expected, "serializeMatrix()");

	// | serializeArray()
	var serialize_array = ["1", "2", "3"];

	var serialize_array_expected = "1,2,3";

	assert.deepEqual(serializeArray(serialize_array), serialize_array_expected, "serializeArray()");

	// | deserializeIntMatrix()
	assert.deepEqual(deserializeIntMatrix(serialize_matrix_expected), serialize_matrix, "deserializeMatrix()");

	// | deserializeStrArray()
	assert.deepEqual(deserializeStrArray(serialize_array_expected), serialize_array, "deserializeStrArray()");
});
/**
 * Converts a matrix (2-dimensional Array) into a string.
 * Rows of the matrix are separated by ';'.
 * Individual values are separated by ','.
 * @param  {Array}  matrix  2d Array representing the matrix.
 * @return {String}         String representing the matrix.
 */
function serializeMatrix(matrix) {
	var len = matrix.length;
	var matrix_str = "";
	for (var i = 0; i < len; i++) {
		matrix_str += matrix[i].join() + ';';	// Use ';' as row separator.
	}
	// Remove last ';'
	matrix_str = matrix_str.slice(0, -1);
	return matrix_str;
}
/**
 * Converts an Array into a comma-separated string.
 * @param  {Array}  arr  Array to be converted.
 * @return {String}      Comma-separated string representation of arr.
 */
function serializeArray(arr) {
	return arr.join();
}

function deserializeMatrix(matrix_str) {
	// Isolate the rows of the matrix
	var rows = matrix_str.split(';');
	var n_rows = rows.length;
	var matrix = [];
	// Separate individual values
	for (var i = 0; i < n_rows; i++) {
		matrix[i] = rows[i].split(',');
	}
	// The values of the matrix are saved as strings;
	// Convert back to numbers
	var n_cols = matrix[0].length;	// Consider all rows of the same length
	for (var i = 0; i < n_rows; i++) {
		for (var j = 0; j < n_cols; j++) {
			matrix[i][j] = parseInt(matrix[i][j]);
		}
	}
	return matrix;
}
/**
 * Converts a comma-separated string into an array.
 * @param  {String} str  String to be converted.
 * @return {Array}     	 Resulting array.
 */
function deserializeStrArray(str) {
	return str.split(',');
}

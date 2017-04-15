QUnit.test("Worker Tests", function(assert) {

	// | getproxyQ()
	var getproxyQ_string = "amazon;american+airlines;american+express;autozone;ariana+grande;apple;aol"
	var getproxyQ_expected = ["amazon", "american+airlines", "american+express", "autozone", "ariana+grande", "apple", "aol"];

	assert.deepEqual(getproxyQ(getproxyQ_string), getproxyQ_expected, "getproxyQ()");

	// | getRandomInt()
	// Note: Given the random nature, this is the only test case that will return a correct value consistently
	var getRandomInt_min = 0;
	var getRandomInt_max = 0;
	var getRandomInt_expected = 0;

	assert.deepEqual(getRandomInt(getRandomInt_min, getRandomInt_max), getRandomInt_expected, "getRandomInt()");
});
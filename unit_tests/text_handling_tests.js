QUnit.test("Text Handling Tests", function(assert) {

	// | getKeywords()
	var getKeywords_training_data = [
		['label1', 'worda wordb wordc wordd word wordf wordb wordc wordd wordf'],
		['label2', 'wordc wordd word wordf wordg wordh']
	];

	var getKeywords_expected = ["worda", "wordb", "wordc", "wordd", "word", "wordf", "wordb", "wordc", 
								"wordd", "wordf", "wordc", "wordd", "word", "wordf", "wordg", "wordh"];

	assert.deepEqual(getKeywords(getKeywords_training_data), getKeywords_expected, "getKeywords()");

	// | getUniqueWords()
	var getUniqueWords_list = ["aaa", "aab", "aaa", "aaa", "abc", "abd", "abc", "add", "adc", "add"];
	var getUniqueWords_expected = ["aaa", "aab", "abc", "abd", "adc", "add"];

	assert.deepEqual(getUniqueWords(getUniqueWords_list), getUniqueWords_expected, "getUniqueWords()");

	// | getWordFreq()
	var getWordFreq_keywords = ["aaa", "aab", "aac", "aad", "aae"];
	var getWordFreq_ad_none = ["baa", "bab", "bac", "bad"]; 
	var getWordFreq_none_expected = [0, 0, 0, 0, 0];
	var getWordFreq_ad = ["aaa", "aaa", "aaa", "aac", "bab", "bad", "aae"];
	var getWordFreq_expected = [0.6, 0, 0.2, 0, 0.2];

	assert.deepEqual(getWordFreq(getWordFreq_keywords, getWordFreq_ad_none), getWordFreq_none_expected, "getWordFreq()");
	assert.deepEqual(getWordFreq(getWordFreq_keywords, getWordFreq_ad), getWordFreq_expected, "getWordFreq()");

	// | getWordFreqPRIPlus()
	var getWordFreqPRIPlus_keywords = ["aaa", "aab", "aac", "aad", "aae"];
	var getWordFreqPRIPlus_ad_none = ["baa", "bab", "bac", "bad"]; 
	var getWordFreqPRIPlus_none_expected = [1, 1, 1, 1, 1];
	var getWordFreqPRIPlus_ad = ["aaa", "aaa", "aaa", "aac", "bab", "bad", "aae"];
	var getWordFreqPRIPlus_expected = [0.596, 0.002, 0.2, 0.002, 0.2];
	var getWordFreqPRIPlus_lambda = 0.01;

	assert.deepEqual(getWordFreqPRIPlus(getWordFreqPRIPlus_keywords, getWordFreqPRIPlus_ad_none, getWordFreqPRIPlus_lambda), getWordFreqPRIPlus_none_expected, "getWordFreqPRIPlus()");
	assert.deepEqual(getWordFreqPRIPlus(getWordFreqPRIPlus_keywords, getWordFreqPRIPlus_ad, getWordFreqPRIPlus_lambda), getWordFreqPRIPlus_expected, "getWordFreqPRIPlus()");

	// | tokeniseText()

	// | removeStopWords()

	// | stemWords()

});
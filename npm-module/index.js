const fs = require('fs');
const alph = 'abcdefghijklmnopqrstuvwxyz'

var dictionaryPath = path.resolve(__dirname, 'dictionary.txt');
var fileContents = fs.readFileSync(dictionaryPath, 'utf8');

var words = fileContents.split('\n');
words = cleanWords(words);

chain = createChain(words);

exports.randomWord = function(length) {
	if (typeof length != "number") {
		throw "randomWord expects a number"
	} else if (length < 2) {
		throw "length must be at least 2"
	}

	return randomWord(chain, length);
}

function createChain(words) {
	chain = {};
	for (const word of words) {
		addWordToChain(chain, word);
	}
	return chain;
}

function addWordToChain(chain, word) {
	updateOccuranceInChain(chain, '', word.slice(0, 2));

	for (var i = 2; i < word.length; i++) {
		prefix = word.substring(i - 2, i);
		updateOccuranceInChain(chain, prefix, word[i]);
	}
}

function updateOccuranceInChain(chain, prefix, occurance) {
	addPrefixIfNew(chain, prefix);
	addPrefixOccuranceIfNew(chain, prefix, occurance);
	chain[prefix][occurance]++;
	chain[prefix]['total']++;
}

function addPrefixIfNew(chain, prefix) {
	if (chain[prefix] == undefined) {
		chain[prefix] = {};
		chain[prefix]['occurances'] = [];
		chain[prefix]['total'] = 0;
	}
}

function addPrefixOccuranceIfNew(chain, prefix, occurance) {
	if (chain[prefix][occurance] == undefined) {
		chain[prefix][occurance] = 0;
		chain[prefix]['occurances'].push(occurance);
	}
}

function randomWord(chain, length) {
	// get initial prefix
	word = randomOccurance(chain, '');

	for (var i = 0; i < length - 2; i++) {
		lastTwoLetters = word.substr(-2);

		// restart if chain hits dead end
		if (chain[lastTwoLetters] == undefined) {
			return randomWord(chain, length);
		}

		word += randomOccurance(chain, lastTwoLetters);
	}

	return word;
}

/*
 * If an occurrence occurs 5 times after a prefix, and the prefix's total
 * is 43, the occurrence has 5/43 chance of being chosen
 */
function randomOccurance(chain, prefix) {
	var index = -1;
	var tracker = randint(1, chain[prefix]['total']);
	while (tracker >= 1) {
		index += 1;
		var currentOccurance = chain[prefix]['occurances'][index];
		tracker -= chain[prefix][currentOccurance];
	}

	return chain[prefix]['occurances'][index];
}

function randint(min, max) {
	return min + Math.floor((max - min) * Math.random());
}

function cleanWords(words) {
	return words.filter(isNotPunctuated)
		    .filter(isNotShort);
}

function isNotPunctuated(word) {
	for (var i = 0; i < word.length; i++) {
		if (!alph.includes(word.charAt(i))) {
			return false;
		}
	}
	return true;
}

function isNotShort(word) {
	if (word.length < 3) {
		return false;
	}
	return true;
}


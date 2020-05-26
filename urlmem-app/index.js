const urlmem = require('urlmem');
const express = require('express'); // import express
const app = express();
const path = require('path');

const shortenedLength = 7;

/*
 * A deployment service might set a correct PORT
 * to use, if no port is set 5000 will probably
 * be free for use.
 */
const port = process.env.PORT || 5000;

// output whether the app runs or errors
app.listen(port, function (err) {
  if (err)
    console.log(err);
  else
    console.log("App running");
});

const longToCustomMappings = {};
const longToRandomMappings = {};
const shortToLongMappings = {};
const usedWords = new Set();

function getNextUnusedWord() {
  let word = urlmem.randomWord(shortenedLength);
  while (usedWords.has(word)) {
    word = urlmem.randomWord(shortenedLength);
  }
  usedWords.add(word);
  return word;
}

function qualify(longUrl) {
  if (longUrl.startsWith('http://') ||
      longUrl.startsWith('https://')) {
    return longUrl;
  }
  return 'http://' + longUrl
}

function customWordUnavailable(longUrl, customUrl) {
  if (usedWords.has(customUrl) &&
      !(customUrl in longToCustomMappings[longUrl])) {
    // already in use
    return true;
  } else if (customUrl == "" || customUrl == "index" ||
             customUrl == "index.htm" || customUrl == "index.html") {
    // reserved for home page
    return true;
  }
  return false;
}

function createCustomMapping(longUrl, customUrl) {
  if (!(longUrl in longToCustomMappings)) {
    longToCustomMappings[longUrl] = []
  }
  longToCustomMappings[longUrl].push(customUrl);

  shortToLongMappings[customUrl] = longUrl;
  usedWords.add(customUrl);

  return customUrl
}

function createRandomMapping(longUrl) {
  let word = getNextUnusedWord();
  longToRandomMappings[longUrl] = word;
  shortToLongMappings[word] = longUrl;
}

// GET route for custom URLs
app.get('/custom', (req, res) => {
  // sanitize input
  if (typeof (req.query.longUrl) !== "string" ||
      typeof (req.query.customUrl) !== "string") {
    res.send({"shortened": null});
    return
  }

  let longUrl = qualify(req.query.longUrl);
  let customUrl = req.query.customUrl;

  if (customWordUnavailable(longUrl, customUrl)) {
    res.send({"shortened": null});
  } else {
    customUrl = createCustomMapping(longUrl, customUrl);
    res.send({"shortened": customUrl});
  }
});

// GET route for random Urls
app.get('/random', (req, res) => {
  // sanitize input
  if (typeof (req.query.longUrl) !== "string") {
    res.send({"shortened": null});
    return
  }

  const longUrl = qualify(req.query.longUrl);
  if (longUrl in longToRandomMappings) {
    res.send({"shortened": longToRandomMappings[longUrl]});
  } else {
    createRandomMapping(longUrl);
    res.send({"shortened": word});
  }
});

app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get('/[a-z]*', (req, res) => {
  let shortenedUrl = req.originalUrl.slice(1);
  if (shortToLongMappings[shortenedUrl]) {
    res.redirect(shortToLongMappings[shortenedUrl]);
  } else {
    res.redirect("/");
  }
});


const urlmem = require('urlmem');
const express = require('express'); // import express
const app = express();
const path = require('path');
const db = require('./queries')

const shortenedLength = 7;

/*
 * A deployment service might set a correct PORT
 * to use, if no port is set 5000 will probably
 * be free for use.
 */
const port = process.env.PORT || 5000;

// output whether the app runs or errors
app.listen(port, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("App running");
  }
});

/*
 * Return a random word that is not currently in use.
 *
 * Note: It is possible that the word will become 'used' immediately after
 * this function returns.
 */
async function getNextUnusedWord() {
  let word = urlmem.randomWord(shortenedLength);
  if (await db.isShortUrlUsed(word)) {
    return await getNextUnusedWord();
  } else {
    return word;
  }
}

/*
 * Add 'http://' to URLs that are missing the http and https prefix.
 */
function qualify(longUrl) {
  if (longUrl.startsWith('http://') ||
      longUrl.startsWith('https://')) {
    return longUrl;
  }
  return 'http://' + longUrl
}

/*
 * Return true if and only if a customUrl is not reserved or currently in use.
 *
 * Note: It is possible that the word will become 'used' immediately after
 * this function returns.
 */
async function customUrlAvailable(customUrl) {
  if (customUrl == "" || customUrl == "index" ||
      customUrl == "index.htm" || customUrl == "index.html") {
    // reserved for home page
    return false;
  } else {
    return !(await db.isShortUrlUsed(customUrl));
  }
}

/*
 * Get the random shorturl associated with a longurl, creating one first if none
 * exists, and then calls callback(randomurl, longurl).
 */
async function getOrCreateRandomMapping(longUrl) {
  // test if random shortening exists
  let randomUrl = await db.getRandomShortening(longUrl);
  if (randomUrl !== null) {
    console.log("got random shortening");
    return randomUrl;
  } else {
    console.log("no shortening found");
    // make new random shortening if it does not exist
    let randomWord = await getNextUnusedWord();
    console.log("got rand word");
    randomUrl = await db.addShortening(randomWord, longUrl, true);
    console.log("tried adding shortening");
    // handle race condition
    if (randomUrl === null) {
      console.log("handling race");
      randomUrl = await getOrCreateRandomMapping(longUrl);
    }
  }
  console.log("url", randomUrl);
  return randomUrl;
}

/*
 * Create a custom shortening if it does not exist and is valid, return null
 * if the shortening does not exist and is not valid.
 */
async function createCustomMapping(customUrl, longUrl) {
  if (!customUrlAvailable(customUrl)) {
    return null;
  }
  return await db.addShortening(randomUrl, longUrl, false);
}

/*
 * Respond with the customurl if it is valid and exists or can be created,
 * otherwise respond with a null shortening.
 */
app.get('/custom', (req, res) => {
  // sanitize input
  if (typeof (req.query.longUrl) !== "string" ||
      typeof (req.query.customUrl) !== "string") {
    res.send({"shortened": null});
  }

  let longUrl = qualify(req.query.longUrl);
  let customUrl = req.query.customUrl;
  db.addShortening(customUrl, longUrl, false).then((resp) => {
    if (resp === null) {
      console.log("unavailable");
      res.send({"shortened": null});
    } else {
      console.log(customUrl, "available");
      res.send({"shortened": customUrl});
    }
  });
});

/*
 * Respond with a random shorturl, creates a new one only if a random shorturl
 * does not already exist.
 */
app.get('/random', (req, res) => {
  // sanitize input
  if (typeof (req.query.longUrl) !== "string") {
    res.send({"shortened": null});
    return
  }

  const longUrl = qualify(req.query.longUrl);
  console.log("qualified");
  getOrCreateRandomMapping(longUrl).then((randomUrl) => {
    res.send({"shortened": randomUrl});
    console.log(randomUrl);
    console.log("response sent");
  });
});

/*
 * Respond with the homepage.
 */
app.use(express.static(path.join(__dirname, 'client', 'build')));

/*
 * Redirect valid shorturl to associated longurl, otherwise redirect home.
 */
app.get('/[a-z]*', (req, res) => {
  let shortenedUrl = req.originalUrl.slice(1);
  db.getLongUrl(shortenedUrl).then((longUrl) => {
    if (longUrl !== null) {
      res.redirect(longUrl);
    } else {
      res.redirect("/");
    }
  });
});


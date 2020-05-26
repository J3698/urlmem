const assert = require('assert');

let client = null;
if (process.env.NODE_ENV === 'production') {
  const { Client } = require('pg');
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    user: 'me',
    database: 'urlmem',
    password: 'password',
    ssl: {
      rejectUnauthorized: false
    }
  });
  client.connect(err => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected')
    }
  });
} else {
  const Pool = require('pg').Pool;
  client = new Pool({
    user: 'me',
    host: 'localhost',
    database: 'urlmem',
    password: 'password',
    port: 5432,
  });
}

let isShortUrlUsedQuery = 'SELECT * FROM shortenings WHERE shorturl = $1';
let getLongUrlQuery = 'SELECT (longurl) FROM shortenings WHERE shorturl = $1';
let getRandomShorteningQuery = 'SELECT (shorturl) FROM shortenings WHERE longurl = $1 AND israndom = True';
let addShorteningQuery = 'INSERT INTO shortenings (shorturl, longurl, israndom) VALUES ($1, $2, $3)';

/*
 * Returns whether a short url is taken.
 *
 * May throw other db errors.
 */
const isShortUrlUsed = async (shortUrl) => {
  let res = await client.query(isShortUrlUsedQuery, [shortUrl]);
  assert(res.rows.length < 2, "short url has multiple rows!");
  return res.rows.length !== 0;
}

/*
 * Returns longurl of shortening if it exists, otherwise null.
 *
 * May throw other db errors.
 */
const getLongUrl = async (shortUrl) => {
  let res = await client.query(getLongUrlQuery, [shortUrl]);
  assert(res.rows.length < 2, "short url has multiple rows!");
  if (res.rows.length === 1) {
    return res.rows[0]['longurl'];
  }
  return null;
}

/*
 * Returns shorturl of random shortening if it exists, otherwise null.
 *
 * May throw other db errors.
 */
const getRandomShortening = async (longUrl) => {
  let res = await client.query(getRandomShorteningQuery, [longUrl]);
  assert(res.rows.length < 2, "random long shortening has multiple rows!");
  if (res.rows.length === 1) {
    return res.rows[0]['shorturl'];
  }
  return null;
}

/*
 * Create a shortening and return the shorturl if successful. Returns null if
 * the shorturl already exists and is not the requested shortening, or if the
 * longurl already has a random shortening and this shortening is also random.
 *
 * May throw other db errors.
 */
const addShortening = async (shortUrl, longUrl, isRandom) => {
  try {
    await client.query(addShorteningQuery, [shortUrl, longUrl, isRandom]);
    return shortUrl;
  } catch (e) {
    if (e.constraint === 'shortenings_pkey') {
        // shortUrl is taken, check if it's the same shortening
        return (await getLongUrl(shortUrl)) === longUrl ? shortUrl : null;
    } else if (e.constraint === 'random_shortening_constraint') {
        // can't add two random urls for one longurl
        return null;
    }
    // some other error
    throw e;
  }
}

module.exports = function() {
  isShortUrlUsed,
  getLongUrl,
  getRandomShortening,
  addShortening,
}

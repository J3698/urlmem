const express = require('express'); // import express
const app = express();

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

// create a GET route
app.get('/greet', (req, res) => {
  res.send("hi");
});

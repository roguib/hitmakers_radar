import express = require('express');
import { TweetParser } from './lib/tweetsParser';

const app: express.Application = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  /*
    We make sure the mongo container has enough time to start listening to connections
    before executing this script
  */
  setTimeout(() => {
    _setUp();
  }, 40000);
});

/*
  This function will be used for setting up a setInterval for the job.
  Warning: Don't set to 0 or otherwise it will execute till the infinity
*/
async function _setUp() {
  let tweetsParser: TweetParser = new TweetParser();
  setInterval(async () => {
    await tweetsParser.processMentions();
  }, 15 * 60 * 1000); // 15 mins
}
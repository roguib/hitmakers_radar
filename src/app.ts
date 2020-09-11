import express = require('express');
import { Mention } from './interface/mention.interface';
import { TweetGateway } from './gateways/tweet.gateway';
import { PendingTweets } from './interface/pendingTweets.interface';
import { TweetParser } from './lib/tweetsParser';

const app: express.Application = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  /*
    The mongo container starts listening after setup function gets executed so the mongoclient
    returns undefined
  */
  setTimeout(() => {
    _setUp();
  }, 40000);
});

/*
  This function will be used for setting up the different jobs we need to do.
  For now we will leave it like this
*/
async function _setUp() {
  let tweetsParser: TweetParser = new TweetParser();
  tweetsParser.retrieveTwitterMentions();
}
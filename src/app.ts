import express = require('express');
import { CONFIG_OPTIONS } from './config/environment.config';

const app: express.Application = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  _setUp();
});

var Twitter = require('twitter');
var client = new Twitter({
  consumer_key: CONFIG_OPTIONS.twitter_api.consumer_key,
  consumer_secret: CONFIG_OPTIONS.twitter_api.consumer_secret,
  access_token_key: CONFIG_OPTIONS.twitter_api.access_token_key,
  access_token_secret: CONFIG_OPTIONS.twitter_api.access_token_secret

});

/*
  This function will be used for setting up the different jobs we need to do.
  For now we will leave it like this
*/
function _setUp() {
  client.get('/statuses/mentions_timeline.json', function(error: any, response: any) {
    if(error) throw error;
    console.log(response);  // Raw response object.
  });
}
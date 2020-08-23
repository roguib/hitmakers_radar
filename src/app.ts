import express = require('express');
import { CONFIG_OPTIONS } from './config/environment.config';
import { Mention } from './interface/mention.interface';

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
    console.log(initInterface(response)); // interface
    let pendingTweets: Array<Mention> = [];
    let mentions: Array<Mention> = initInterface(response);
    // TODO: Make this code more efficient
    mentions.forEach(mention => {
      if (mention.in_reply_to_user_id == null) { // candidate mention
        let hasResponseFromBot: boolean = false;
        for (let i = 0; i < mentions.length; ++i) {
          if (mention.id !== mentions[i].id && mention.in_reply_to_status_id === mentions[i].id && mention.user.screen_name === 'hitmakers_radar') {
            hasResponseFromBot = true;
            break;
          }
        }
        if (!hasResponseFromBot) pendingTweets.push(mention); // we should save pendingTweets on the db
      }
    });
    console.log('pending tweets ', pendingTweets);
  });
}

function initInterface(response: any): Array<Mention> {
  let res: Array<Mention> = [];
  response.forEach((mention: any) => {
    res.push({
      created_at: mention.created_at,
      id: mention.id,
      text: mention.text,
      in_reply_to_status_id: mention.in_reply_to_status_id,
      in_reply_to_screen_name: mention.in_reply_to_screen_name,
      in_reply_to_user_id: mention.in_reply_to_user_id,
      user: {
        id: mention.user.id,
        name: mention.user.name,
        screen_name: mention.user.screen_name
      }
    });
  });
  return res;
}
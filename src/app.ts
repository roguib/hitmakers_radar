import express = require('express');
import { CONFIG_OPTIONS } from './config/environment.config';
import { Mention } from './interface/mention.interface';
import { TweetGateway } from './gateways/tweet.gateway';
import { PendingTweets } from './interface/pendingTweets.interface';

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
async function _setUp() {
  client.get('/statuses/mentions_timeline.json', async function(error: any, response: any) {
    if(error) throw error;
    //console.log(response);  // Raw response object.
    //console.log(initInterface(response)); // interface
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
    let tg = new TweetGateway();
    await tg.savePendingTweets(pendingTweets);
    console.log('retrieving pending tweets to be replyed by the bot');
    let pTweets: Array<PendingTweets> = await tg.retrievePendingTweets();
    console.log('pending tweets retrieved in setup func', pTweets);
    console.log('retrieving recomended songs for every pending user');
    let recomendedSongsForUsers: Array<any> = [];
    for (let i = 0; i < pTweets.length; ++i) {
      let aux: Array<number> = await tg.retrieveRecomendedSongsIdByUserId(pTweets[i].userId);
      let song: any = await tg.retrieveSongRecomendation(aux);
      await tg.markSongAsRecommended(pTweets[i].userId, song._id);
      recomendedSongsForUsers.push({
        userId: pTweets[i].userId,
        songRecomendation: song
      });
    }
    console.log('recomended songs for every user: ', recomendedSongsForUsers);
  });
}

function initInterface(response: any): Array<Mention> {
  let res: Array<Mention> = [];
  response.forEach((mention: any) => {
    res.push({
      created_at: mention.created_at,
      id: mention.id,
      _id: undefined,
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
// TODO: Replace this outdated lib for twitter-lite. Source: https://github.com/draftbit/twitter-lite
// twitter package presents several problems: it rounds id of tweets if using number variables,
// and also doesn't support auto_populate_reply_metadata in status/update
var Twitter = require('twitter');
import { CONFIG_OPTIONS } from '../config/environment.config';
import { Mention } from '../interface/mention.interface';
import { TweetGateway } from '../gateways/tweet.gateway';
import { PendingTweets } from '../interface/pendingTweets.interface';

export class TweetParser {
    
  public client = new Twitter({
    consumer_key: CONFIG_OPTIONS.twitter_api.consumer_key,
    consumer_secret: CONFIG_OPTIONS.twitter_api.consumer_secret,
    access_token_key: CONFIG_OPTIONS.twitter_api.access_token_key,
    access_token_secret: CONFIG_OPTIONS.twitter_api.access_token_secret
  });

  constructor() {
  }

  public async processMentions() {
    console.log('BEGIN EXEC RETRIEVE TWITTER MENTIONS FUNC');
    await this.retrieveTwitterMentions(async () => {
      console.log('INSIDE CALLBACK RETRIEVE TWITTER MENTIONS FUNC');
      console.log('BEGIN EXEC REPLY TO PENDING MENTIONS FUNC');
      await this.replyToPendingMentions();
      console.log('END EXEC REPLY TO PENDING MENTIONS FUNC');
    });
    console.log('END EXEC RETRIEVE TWITTER MENTIONS FUNC');
  }

  private async retrieveTwitterMentions(callback: CallableFunction) {
    await this.client.get('/statuses/mentions_timeline.json', async (error: any, response: any) => {
      if(error) throw error;
      //console.log(response);  // Raw response object.
      //console.log(initInterface(response)); // interface
      let pendingTweets: Array<Mention> = [];
      let mentions: Array<Mention> = this.initInterface(response);
      // TODO: Make this code more efficient
      console.log('mentions: ', mentions);
      // TODO: Replace forEach with for
      mentions.forEach(mention => {
        if (mention.in_reply_to_status_id == null) { // candidate mention to be processed by the bot
          pendingTweets.push(mention);
        }
      });
      console.log('candidate pending tweets ', pendingTweets);
      let tg = new TweetGateway();
      await tg.savePendingTweets(pendingTweets);
      callback(true);
    });
  }

  private async replyToPendingMentions() {
    let tg = new TweetGateway();
    console.log('retrieving pending tweets to be replyed by the bot');
    let pTweets: Array<PendingTweets> = await tg.retrievePendingTweets();
    console.log('pending tweets retrieved in setup func', pTweets);
    console.log('retrieving recomended songs for every pending user');
    let recomendedSongsForUsers: Array<any> = [];
    for (let i = 0; i < pTweets.length; ++i) {
      let aux: Array<number> = await tg.retrieveRecomendedSongsIdByUserId(pTweets[i].userId);
      if (aux == undefined) aux = []; // case when retrieveRecomendedSongsIdByUserId returns empty
      let song: any = await tg.retrieveSongRecomendation(aux);
      await tg.markSongAsRecommended(pTweets[i].userId, song._id);
      recomendedSongsForUsers.push({
        in_reply_to_status_id: pTweets[i].in_reply_to_status_id?.toString(),
        userId: pTweets[i].userId,
        songRecomendation: song
      });
      await tg.markTweetAsProcessed(pTweets[i]);
      const inReplyToStatusId: string | undefined = pTweets[i].in_reply_to_status_id?.toString();
      if (inReplyToStatusId) this.commentPendingMentions(pTweets[i].screen_name, song.song, song.artist, inReplyToStatusId);
      else console.log(`in_reply_to_status_id is undefined. Unable to send a response`);
    }
  }

  private initInterface(response: any): Array<Mention> {
    let res: Array<Mention> = [];
    // TODO: Replace forEach with for
    response.forEach((mention: any) => {
      res.push({
        created_at: mention.created_at,
        id: mention.id_str,
        _id: undefined,
        text: mention.text,
        in_reply_to_status_id: mention.in_reply_to_status_id_str,
        in_reply_to_screen_name: mention.in_reply_to_screen_name_str,
        in_reply_to_user_id: mention.in_reply_to_user_id_str,
        user: {
          id: mention.user.id_str,
          name: mention.user.name,
          screen_name: mention.user.screen_name
        }
      });
    });
    return res;
  }

  private commentPendingMentions(screenName: string, songName: string, songArtist: string, inReplyToStatusId: string): void {
    console.log('responding processed tweet');
    try {
      const status = `Here is a song for you @${screenName}: ${songName} - ${songArtist}`;
      console.log(`necessary data for replying: ${screenName} ${songName} ${songArtist} ${inReplyToStatusId}`)
      this.client.post('statuses/update', {
        status: status,
        in_reply_to_status_id: inReplyToStatusId,
        username: "rgrgib"
      });
    } catch (e) {
      console.log('error');
      console.error(e);
    }
  }
}
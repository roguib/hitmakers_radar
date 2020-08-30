import { Mention } from '../interface/mention.interface';
import mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
import { BaseGateway } from './base.gateway';

// TODO: Try to use the base gateway class for connecting into the db
export class TweetGateway extends BaseGateway {
    constructor() {
        super();
    }

    public async savePendingTweets(mentions: Array<Mention>) {
        const c = this.mongoClient();
        try {
            await c.connect();
            let processedTweets: Array<any> = await c.db('hitmakers_radar').collection('pending_tweets').aggregate([
                {
                    $lookup: {
                        from: 'responded_tweets',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'processed_tweets'
                    }
                }
            ]).toArray();
            console.log('tweets have already been processed: ', processedTweets);
            // TODO: Make this algorithm more efficient
            for (let i = 0; i < mentions.length; ++i) {
                let f: boolean = false;
                for (let j = 0; j < processedTweets.length; ++j) {
                    if (mentions[i].id == processedTweets[j]._id) {
                        console.log('mention is present on the db:', mentions[i]);
                        f = true;
                        break;
                    }
                }
                if (!f) {
                    console.log('mention is not present on the db:', mentions[i]);
                    await c.db('hitmakers_radar').collection('pending_tweets').insertOne({
                        _id: mentions[i].id,
                        created_at: mentions[i].created_at,
                        text: mentions[i].text,
                        in_reply_to_status_id: mentions[i].in_reply_to_status_id,
                        in_reply_to_user_id: mentions[i].in_reply_to_user_id,
                        in_reply_to_screen_name: mentions[i].in_reply_to_screen_name,
                        user: {
                            id: mentions[i].user.id,
                            name: mentions[i].user.name,
                            screen_name: mentions[i].user.screen_name
                        }
                    });
                } else console.log('mention already on the db', mentions[i]);
            }
            await this.close();
        } catch (e) {
            console.error(e);
        }
    }
}
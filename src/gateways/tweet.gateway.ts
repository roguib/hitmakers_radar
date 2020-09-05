import { Mention } from '../interface/mention.interface';
import mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
import { BaseGateway } from './base.gateway';
import { PendingTweets } from '../interface/pendingTweets.interface';
import { response } from 'express';

// TODO: Try to use the base gateway class for connecting into the db
export class TweetGateway extends BaseGateway {
    constructor() {
        super();
    }

    public async savePendingTweets(mentions: Array<Mention>) {
        const c = this.mongoClient();
        try {
            await this.connect();
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

    public async retrievePendingTweets(): Promise<Array<PendingTweets>> {
        // const c = new MongoClient('mongodb://mongo:27017');
        const c = this.mongoClient();
        let res: Array<PendingTweets> = [];
        try {
            await this.connect();
            let queryResArray: Array<Mention> = await c.db('hitmakers_radar')
                .collection('pending_tweets')
                .find()
                .toArray();
            for (let i = 0; i < queryResArray.length; ++i) {
                res.push({
                    screen_name: queryResArray[i].user.screen_name,
                    in_reply_to_status_id: queryResArray[i]._id,
                    userId: queryResArray[i].user.id
                });
            }
            await this.close();
        } catch (e) {
            console.error(e);
        }
        return res;
    }

    // TODO: Move this to another gateway
    public async retrieveRecomendedSongsIdByUserId(userId: number): Promise<Array<number>> {
        // const c = new MongoClient('mongodb://mongo:27017');
        const c = this.mongoClient();
        let res: Array<number> = [];
        try {
            await this.connect();
            console.log('searching for user with id: ', userId);
            let document: any = await c.db('hitmakers_radar')
                .collection('users')
                .findOne( { _id: userId } );
            // document always is an array so we need to check if it contains at least one elem
            res = document?.recommended_songs;
            console.log('already recommended: ', res);
            await this.close();
            return res;
        } catch (e) {
            console.error(e);
        }
        return res;
    }

    public async retrieveSongRecomendation(songsAlreadyRecommended: Array<number>): Promise<Array<any>> {
        const c = this.mongoClient();
        let res: any;
        try {
            await this.connect();
            console.log('searching for a song that is not: ', songsAlreadyRecommended);
            let document: any = await c.db('hitmakers_radar')
                .collection('songs')
                .findOne( { _id: { $nin: songsAlreadyRecommended } } );
            // document always is an array so we need to check if it contains at least one elem
            console.log('document: ', document);
            res = document;
            await this.close();
            return res;
        } catch (e) {
            console.error(e);
        }
        return res;
    }

    public async markSongAsRecommended(userId: number, songId: any) {
        const c = this.mongoClient();
        try {
            await this.connect();
            console.log(`marking the song ${songId} as recomended for the user ${userId}`);
            let document: any = await c.db('hitmakers_radar')
                .collection('users')
                .updateOne( 
                    { _id: userId },
                    { $push: { recommended_songs: songId } },
                    { upsert: true } 
                );
            // document always is an array so we need to check if it contains at least one elem
            console.log('document: ', document.result);
            await this.close();
        } catch (e) {
            console.error(e);
        }
    }

    public async markTweetAsProcessed(pTweets: PendingTweets) {
        const c = this.mongoClient();
        try {
            await this.connect();
            await c.db('hitmakers_radar')
                .collection('pending_tweets')
                .deleteOne( { _id: pTweets.in_reply_to_status_id } );
            await c.db('hitmakers_radar')
                .collection('processed_tweets')
                .insert({
                    _id: pTweets.in_reply_to_status_id,
                    userId: pTweets.userId
                });
        } catch (e) {
            console.error(e);
        }
    }
}
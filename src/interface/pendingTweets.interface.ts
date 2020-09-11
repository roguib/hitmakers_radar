// TODO: Remove camel case names
export interface PendingTweets {
    screen_name: string;
    // has to be opt since _id is opt in Mentions interface
    // and later on assinged to in_reply_to_status_id
    in_reply_to_status_id?: string;
    userId: string;
}
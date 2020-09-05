export interface PendingTweets { //change name convention
    screen_name: string;
    in_reply_to_status_id: number | undefined;
    userId: number;
}
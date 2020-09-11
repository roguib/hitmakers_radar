import { User } from "./user.interface";

// TODO: Remove camel case names
export interface Mention {
    created_at: string;
    id: string;
    _id?: string; // TODO: make it opt
    text: string;
    in_reply_to_status_id: string;
    in_reply_to_user_id: string;
    in_reply_to_screen_name: string;
    user: User;
}
import { User } from "./user.interface";

export interface Mention {
    created_at: string;
    id: number;
    text: string;
    in_reply_to_status_id: number;
    in_reply_to_user_id: number;
    in_reply_to_screen_name: string;
    user: User;
}
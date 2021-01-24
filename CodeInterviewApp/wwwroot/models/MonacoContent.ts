import { User } from "./User";

export class MonacoContent {
    id: number;
    name: string;
    content: string;
    password: string;
    num_viewers: number;
    num_editors: number;
    current_version:number;
    line_number:number;
    users:User[];
}
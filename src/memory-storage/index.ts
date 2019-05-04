import {default as CoreUser} from '../models/user';
import Stored from './storage';

export class User extends Stored<CoreUser, typeof CoreUser>(CoreUser) {
    public static async get({id, username}: {
        id?: number;
        username?: string;
    }): Promise<User|null> {
        if (id && username || !id && !username)
            throw new Error('Either "id" or "username" should be provided.');
        if (id)
            return this.items[id] || null;
        else {
            for (const id in this.items)
                if (this.items[id].username === username)
                    return this.items[id];
            return null;
        }
    }
}

import {User as CoreUser, AccessToken as CoreAccessToken} from '../models';
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

export class AccessToken extends
    Stored<CoreAccessToken, typeof CoreAccessToken>(CoreAccessToken) {
    public static async get({token, userId, expired}: {
        token: string;
        userId?: number;
        expired?: boolean;
    }): Promise<AccessToken|null> {
        return Object.values(this.items)
            .filter((item): boolean => (
                item.token === token &&
                (!userId || item.user.id === userId) &&
                (expired === undefined || item.expired() === expired)
            ))[0] || null;
    }

    public static async filter({userId, expired}: {
        userId?: number;
        expired?: boolean;
    }): Promise<AccessToken[]> {
        return Object.values(this.items)
            .filter((item): boolean => (
                (!userId || item.user.id === userId) &&
                (expired === undefined || item.expired() === expired)
            ));
    }
}

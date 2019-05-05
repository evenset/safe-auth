import {
    AccessToken as CoreAccessToken,
    User as CoreUser,
} from '../models';
import Stored from './storage';

export class AccessToken extends
    Stored<CoreAccessToken, typeof CoreAccessToken>(CoreAccessToken) {
    public static async first({token, userId, expired, consumed, active}: {
        token: string;
        userId?: number;
        expired?: boolean;
        consumed?: boolean;
        active?: boolean;
    }): Promise<AccessToken|null> {
        const items = Object.values(this.items)
            .filter((item): boolean => (
                item.token === token &&
                (!userId || item.user.id === userId) &&
                (expired === undefined || item.isExpired() === expired) &&
                (consumed === undefined || item.isConsumed() === consumed) &&
                (active === undefined || item.isActive() === active)
            ));
        return items[0] || null;
    }

    public static async filter({userId, expired, consumed, active}: {
        userId?: number;
        expired?: boolean;
        consumed?: boolean;
        active?: boolean;
    }={}): Promise<AccessToken[]> {
        return Object.values(this.items)
            .filter((item): boolean => (
                (!userId || item.user.id === userId) &&
                (expired === undefined || item.isExpired() === expired) &&
                (consumed === undefined || item.isConsumed() === consumed) &&
                (active === undefined || item.isActive() === active)
            ));
    }
}

export class User extends Stored<CoreUser, typeof CoreUser>(CoreUser) {
    protected static AccessTokenClass = AccessToken;

    public static async first({id, username}: {
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

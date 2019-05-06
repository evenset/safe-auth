import {
    AccessToken as CoreAccessToken,
    User as CoreUser,
} from '../models';
import Stored from './storage';

/*
 * AccessToken class implemented to use dummy in memory database
 */
export class AccessToken extends
    Stored<CoreAccessToken, typeof CoreAccessToken>(CoreAccessToken) {
    /**
     * Looks an AccessToken up in memory based on its token, refreshToken,
     * userId, its expired status, its consumed status or its active status
     *
     * @param {Object} filters Filters object
     * @param {string} filters.token Token
     * @param {string} filters.refreshToken Refresh token
     * @param {number} filters.userId User
     * @param {boolean} filters.expired Expired
     * @param {boolean} filters.consumed Consumed
     * @param {boolean} filters.active Active
     */
    public static async first({
        token,
        refreshToken,
        userId,
        expired,
        consumed,
        active,
    }: {
        /** Token */
        token: string;
        /** Refresh token */
        refreshToken?: string;
        /** User */
        userId?: number;
        /** Expired */
        expired?: boolean;
        /** Consumed */
        consumed?: boolean;
        /** Active */
        active?: boolean;
    }): Promise<AccessToken|null> {
        const items = Object.values(this.items)
            .filter((item): boolean => (
                (token === undefined || item.token === token) &&
                (
                    refreshToken === undefined ||
                    item.refreshToken === refreshToken
                ) &&
                (userId === undefined || item.user.id === userId) &&
                (expired === undefined || item.isExpired() === expired) &&
                (consumed === undefined || item.isConsumed() === consumed) &&
                (active === undefined || item.isActive() === active)
            ));
        return items[0] || null;
    }

    /**
     * Looks up AccessTokens in memory based on its userId, its expired status,
     * its consumed status or its active status
     *
     * @param {Object} filters Filters object
     * @param {number} filters.userId User
     * @param {boolean} filters.expired Expired
     * @param {boolean} filters.consumed Consumed
     * @param {boolean} filters.active Active
     */
    public static async filter({userId, expired, consumed, active}: {
        /** User */
        userId?: number;
        /** Expired */
        expired?: boolean;
        /** Consumed */
        consumed?: boolean;
        /** Active */
        active?: boolean;
    }={}): Promise<AccessToken[]> {
        return Object.values(this.items)
            .filter((item): boolean => (
                (userId === undefined || item.user.id === userId) &&
                (expired === undefined || item.isExpired() === expired) &&
                (consumed === undefined || item.isConsumed() === consumed) &&
                (active === undefined || item.isActive() === active)
            ));
    }
}

/*
 * User class implemented to use in memory dummy database
 */
export class User extends Stored<CoreUser, typeof CoreUser>(CoreUser) {
    /**
     * A reference to the AccessToken class that's going to be used in
     * internal methods of User class
     */
    protected static AccessTokenClass = AccessToken;

    /**
     * Looks a User up in memory based on its id or username
     *
     * @param {Object} filters Filters object
     * @param {number} filters.id Id
     * @param {strign} filters.username Username
     */
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

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
     * @param {boolean} filters.isExpired Expired status
     * @param {boolean} filters.isConsumed Consumed status
     * @param {boolean} filters.isActive Activation status
     */
    public static async first({
        token,
        refreshToken,
        userId,
        isExpired,
        isConsumed,
        isActive,
    }: {
        /** Token */
        token?: string;
        /** Refresh token */
        refreshToken?: string;
        /** User */
        userId?: number;
        /** Expired */
        isExpired?: boolean;
        /** Consumed */
        isConsumed?: boolean;
        /** Active */
        isActive?: boolean;
    }): Promise<AccessToken|null> {
        const items = Object.values(this.items)
            .filter((item): boolean => (
                (token === undefined || item.token === token) &&
                (
                    refreshToken === undefined ||
                    item.refreshToken === refreshToken
                ) &&
                (userId === undefined || item.user.id === userId) &&
                (isExpired === undefined || item.isExpired() === isExpired) &&
                (
                    isConsumed === undefined ||
                    item.isConsumed() === isConsumed
                ) &&
                (isActive === undefined || item.isActive() === isActive)
            ));
        return items[0] || null;
    }

    /**
     * Looks up AccessTokens in memory based on its userId, its expired status,
     * its consumed status or its active status
     *
     * @param {Object} filters Filters object
     * @param {number} filters.userId User
     * @param {boolean} filters.isExpired Expired status
     * @param {boolean} filters.isConsumed Consumed status
     * @param {boolean} filters.isActive Activation status
     */
    public static async filter({userId, isExpired, isConsumed, isActive}: {
        /** User */
        userId?: number;
        /** Expired */
        isExpired?: boolean;
        /** Consumed */
        isConsumed?: boolean;
        /** Active */
        isActive?: boolean;
    }): Promise<AccessToken[]> {
        return Object.values(this.items)
            .filter((item): boolean => (
                (userId === undefined || item.user.id === userId) &&
                (isExpired === undefined || item.isExpired() === isExpired) &&
                (
                    isConsumed === undefined ||
                    item.isConsumed() === isConsumed
                ) &&
                (isActive === undefined || item.isActive() === isActive)
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
     * @param {boolean} filters.isActive Activation status
     */
    public static async first({id, username, isActive}: {
        /** Id */
        id?: number;
        /** Username*/
        username?: string;
        /** Active */
        isActive?: boolean;
    }): Promise<User|null> {
        const items = Object.values(id !== undefined
            ? [this.items[id]]
            : this.items)
            .filter((item): boolean => (
                (username === undefined || item.username === username) &&
                (isActive === undefined || item.isActive === isActive)
            ));
        return items[0] || null;
    }
}

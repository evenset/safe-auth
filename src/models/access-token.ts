import {User} from './index';

interface Constructor<T = {}> {
    new(...args: any[]): T;
}

/**
 * Issuing and authenticating tokens is the main purpose of this class.
 * To be subclassed by a class that implements storage methods (save, get and
 * remove)
 */
export default abstract class AccessToken {
    /**
     * Primary key
     */
    public abstract id: number;
    /**
     * Token string - autogenerated no need to be filled
     */
    public abstract token: string;
    /**
     * Refresh token string - autogenerated no need to be filled
     */
    public abstract refreshToken: string;
    /**
     * Timestamp in which this token will get expired, it only affects `token`
     * and has no effect on `refreshToken`
     */
    public abstract expires: Date|null;
    /**
     * The user that this access token belongs to
     */
    public abstract user: User;
    /**
     * Indicates that whether `refreshToken` is used or not, as soon as it's
     * used this field will be true and the `AccessToken` instance will become
     * inactive
     */
    protected abstract consumed: boolean;
    /**
     * Timestamp of the creation of the instance
     */
    public abstract createdAt: Date;
    /**
     * Timestamp of the last update on the instance (last time save method has
     * been called)
     */
    public abstract updatedAt: Date;

    /**
     * Creates an AccessToken for a user setting its expiration date
     */
    public constructor(...args: any[]) {
    }

    /**
     * Saves the AccessToken instance in databse
     */
    public abstract async save(): Promise<void>;

    /**
     * Looks an AccessToken up in database based on its token, refreshToken,
     * userId, its expired status, its consumed status or its active status
     */
    public static async first(filters: {
        /** Token */
        token?: string;
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
        throw new Error(`"first" method is not implemented for "${this.name}"`);
    }

    /**
     * Looks up AccessTokens in database based on its userId,
     * its expired status, its consumed status or its active status
     *
     * @param {Object} filters Filters object
     * @param {number} filters.userId User
     * @param {boolean} filters.expired Expired
     * @param {boolean} filters.consumed Consumed
     * @param {boolean} filters.active Active
     */
    public static async filter(filters: {
        /** User */
        userId?: number;
        /** Expired */
        expired?: boolean;
        /** Consumed */
        consumed?: boolean;
        /** Active */
        active?: boolean;
    }): Promise<AccessToken[]> {
        throw new Error(`"filter" method is not implemented for "${this.name}"`);
    }

    /**
     * Removes the AccessToken from database
     */
    public abstract remove(): Promise<void>;

    /**
     * Checks if this AccessToken is active (not expired and not consumed)
     */
    public isActive(): boolean {
        return !this.isExpired() && !this.isConsumed();
    }

    /**
     * Checks if this AccessToken is expired, returns true if expired and
     * returns false otherwise.
     */
    public isExpired(): boolean {
        return this.expires === null ? true : this.expires <= new Date();
    }

    /**
     * Checks if this AccessToken is consumed, returns true if consumed and
     * returns false otherwise.
     */
    public isConsumed(): boolean {
        return this.consumed;
    }

    /**
     * Revokes this AccessToken
     */
    public async revoke(): Promise<void> {
        return await this.remove();
    }

    /**
     * Issue a new pair of access token and refresh token
     */
    public static async issue(user: User): Promise<AccessToken> {
        // TODO: Configurable expiration time
        const constructor = this as (typeof AccessToken & Constructor);

        const accessToken = new constructor({
            user,
            expires: new Date(new Date().getTime() + 10 * 60 * 1000),
        }) as AccessToken;
        await accessToken.save();
        return accessToken;
    }

    /**
     * Authenticates a token. If successful returns a user
     * otherwise returns null
     */
    public static async authenticate(token: string): Promise<User|null> {
        const accessToken = await this.first({token});
        if (
            accessToken && accessToken.isActive() &&
            accessToken.user && accessToken.user.isActive
        ) {
            return accessToken.user;
        }
        return null;
    }

    /**
     * If an active "AccessToken" with its "refreshToken" equal to the token
     * parameter of this method, it'll get consumed, a new "AccessToken" will
     * be issued and returns. Otherwise it's a no-op and returns null.
     */
    public static async refreshToken(
        refreshToken: string,
    ): Promise<AccessToken|null> {
        const accessToken = await this.first({refreshToken});
        if (
            accessToken && accessToken.isActive() &&
            accessToken.user && accessToken.user.isActive
        ) {
            accessToken.consumed = true;
            await accessToken.save();
            return await this.issue(accessToken.user);
        }
        return null;
    }
}

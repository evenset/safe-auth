import crypto from 'crypto';
import {User} from './index';

interface Constructor<T = {}> {
    new(...args: any[]): T;
}

/**
 * AccessToken
 *
 * Issuing and authenticating tokens is the main purpose of this class.
 */
export default abstract class AccessToken {
    public abstract id: number;
    public token: string;
    public refreshToken: string;
    public expires: Date|null;
    public user: User;
    protected consumed: boolean;
    public abstract createdAt: Date;
    public abstract updatedAt: Date;

    /**
     * constructor
     *
     * Creates an AccessToken for a user setting its expiration date
     */
    public constructor({user, expires}: {user: User; expires: Date|null}) {
        this.token = crypto
            .randomBytes(22)
            .toString('base64')
            .replace(/=*$/g, '');
        this.refreshToken = crypto
            .randomBytes(22)
            .toString('base64')
            .replace(/=*$/g, '');
        this.user = user;
        this.expires = expires;
        this.consumed = false;
    }

    /**
     * save
     *
     * Saves the AccessToken instance in databse
     */
    public abstract save(): Promise<void>;

    /**
     * first
     *
     * Looks an AccessToken up in database based on its token, userId or
     * expiration time
     */
    public static async first({token, userId, expired}: {
        token: string;
        userId?: number;
        expired?: boolean;
        consumed?: boolean;
        active?: boolean;
    }): Promise<AccessToken|null> {
        throw new Error('Not implemented');
    }

    /**
     * filter
     *
     * Looks up AccessTokens in database based on their userId or expiration
     * time
     */
    public static async filter({userId, expired}: {
        userId?: number;
        expired?: boolean;
        consumed?: boolean;
        active?: boolean;
    }): Promise<AccessToken[]> {
        throw new Error('Not implemented');
    }

    /**
     * remove
     *
     * Removes the AccessToken from database
     */
    public abstract remove(): Promise<void>;

    /**
     * isActive
     *
     * Checks if this AccessToken is active (not expired and not consumed)
     */
    public isActive(): boolean {
        return !this.isExpired() && !this.isConsumed();
    }

    /**
     * expired
     *
     * Checks if this AccessToken is expired, returns true if expired and
     * returns false otherwise.
     */
    public isExpired(): boolean {
        return this.expires === null ? true : this.expires <= new Date();
    }

    /**
     * isConsumed
     *
     * Checks if this AccessToken is consumed, returns true if consumed and
     * returns false otherwise.
     */
    public isConsumed(): boolean {
        return this.consumed;
    }

    /**
     * revoke
     *
     * Revokes this AccessToken
     */
    public async revoke(): Promise<void> {
        return await this.remove();
    }

    /**
     * issue
     *
     * Issue a new pair of access token and refresh token
     */
    public static async issue(user: User): Promise<AccessToken> {
        // TODO: Configurable expiration time
        const constructor = this as (typeof AccessToken & Constructor);

        const accessToken = new constructor({
            user,
            expires: new Date(new Date().getTime() + 10 * 60 * 1000),
        }) as AccessToken;
        return accessToken;
    }

    /**
     * authenticate
     *
     * Authenticates a token. If successful returns a user
     * otherwise returns null
     */
    public static async authenticate(token: string): Promise<User|null> {
        const accessToken = await this.first({token});
        if (accessToken && accessToken.isActive()) {
            return accessToken.user;
        }
        return null;
    }
}

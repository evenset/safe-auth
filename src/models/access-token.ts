import crypto from 'crypto';
import {RefreshToken, User} from './index';

export default abstract class AccessToken {
    public abstract id: number;
    public token: string;
    public expires: Date;
    public user: User;
    public abstract createdAt: Date;
    public abstract updatedAt: Date;

    /**
     * constructor
     *
     * Creates an AccessToken for a user setting its expiration date
     */
    public constructor({user, expires}: {user: User; expires: Date}) {
        this.token = crypto
            .randomBytes(22)
            .toString('base64')
            .replace(/=*$/g, '');
        this.user = user;
        this.expires = expires;
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
    public static first({token, userId, expired}: {
        token: string;
        userId?: number;
        expired?: boolean;
    }): Promise<AccessToken|null> {
        throw new Error('Not implemented');
    }

    /**
     * filter
     *
     * Looks up AccessTokens in database based on their userId or expiration
     * time
     */
    public static filter({userId, expired}: {
        userId?: number;
        expired?: boolean;
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
     * expired
     *
     * Checks if this AccessToken is expired, returns true if expired and
     * returns false otherwise.
     */
    public expired(): boolean {
        return this.expires <= new Date();
    }

    /**
     * revoke
     *
     * Revokes this AccessToken
     */
    public async revoke(): Promise<void> {
        const refreshToken = RefreshToken.first({
            accessTokenId: this.id,
        });
        if (refreshToken) {
            await refreshToken.remove();
        }
        return await this.remove();
    }
}

import crypto from 'crypto';
import {AccessToken, RefreshToken} from './index';

export default abstract class User {
    public abstract id: number;
    public abstract username: string;
    public abstract password: string;
    public abstract createdAt: Date;
    public abstract updatedAt: Date;

    /**
     * create
     *
     * Creates a user instance and sets its usrname and password
     */
    public static create(username: string, password: string): Promise<User> {
        throw new Error('Not implemented');
    }

    /**
     * remove
     *
     * Removes the user instance from database
     */
    public abstract remove(): Promise<void>;

    /**
     * save
     *
     * Saves the user instance in databse
     */
    public abstract save(): Promise<void>;

    /**
     * get
     *
     * Looks a user up in database based on its id or username
     */
    public static get({id, username}: {
        id?: number;
        username?: string;
    }): Promise<User> {
        throw new Error('Not implemented');
    }

    /**
     * getAccessToken
     *
     * Takes a string token and returns the AccessToken instance with that
     * token that belongs to the user instance (has its user foreign key set to
     * the user instance).
     */
    public async getAccessToken(token: string): Promise<AccessToken> {
        return await AccessToken.get({token, userId: this.id});
    }

    /**
     * getAccessTokens
     *
     * Returns all AccessToken instances that belong to this user (have their
     * user foreign key set to the user instance).
     */
    public async getAccessTokens(): Promise<AccessToken[]> {
        return await AccessToken.filter({userId: this.id});
    }

    /**
     * getActiveAccessTokens
     *
     * Returns all AccessToken instances that belong to this user (have their
     * user foreign key set to the user instance) and are not expired yet.
     */
    public async getActiveAccessTokens(): Promise<AccessToken[]> {
        return await AccessToken.filter({userId: this.id, expired: false});
    }


    /**
     * getRefreshToken
     *
     * Takes a string token and returns the RefreshToken instance with that
     * token that belongs to the user instance (has its user foreign key set to
     * the user instance).
     */
    public async getRefreshToken(token: string): Promise<RefreshToken> {
        return await RefreshToken.get({token, userId: this.id});
    }

    /**
     * getActiveRefreshTokens
     *
     * Returns all RefreshToken instances that belong to this user (have their
     * user foreign key set to the user instance) and are not consumed yet.
     */
    public async getActiveRefreshTokens(): Promise<RefreshToken[]> {
        return await RefreshToken.filter({userId: this.id, consumed: false});
    }

    /**
     * hashPassword
     *
     * Takes a password and returns a salted hash of it
     */
    public static hashPassword(password: string): string { // TODO: config
        const algorithm = 'sha256';
        const iterations = 240000;
        const keyLength = 32;
        // In order to achieve mostly unique salt per user, we generate 72 bit
        // salts here.
        const salt = crypto.randomBytes(9).toString('base64');
        const hash = crypto.pbkdf2Sync(
            password,
            salt,
            iterations,
            keyLength,
            algorithm,
        ).toString('base64');
        return `${algorithm}$${iterations}$${salt}$${hash}`;
    }

    /**
     * setPassword
     *
     * Set the user's password and saves the user instance. It stores a salted
     * hashed version of password instead, raw password is never saved.
     */
    public async setPassword(password: string): Promise<void> {
        this.password = User.hashPassword(password);
        return await this.save();
    }

    /**
     * checkPassword
     *
     * As raw passwords are not saved, this method is useful to check a raw
     * password against the hashed password of the user stored in database.
     * If passwords match it reutns true, otherwise it returns false.
     */
    public checkPassword(password: string): boolean {
        return this.password === User.hashPassword(password);
    }

    /**
     * authenticate
     *
     * Takes a username and password and checks if they match with a user.
     * If it matches it returns the matching user, otherwise it returns null
     */
    public static async authenticate(
        username: string,
        password: string,
    ): Promise<User|null> {
        const user = await User.get({username});
        if (!user) {
            // This is required to keep the response time of this function the
            // same whether the user exists or not. So that an attacker can't
            // understand if the user exists or not by measuring the response
            // time
            User.hashPassword(password);
            return null;
        }
        if (!user.checkPassword(password)) {
            return null;
        }
        return user;
    }

    /**
     * logout
     *
     * Takes a token string. If there's an active access token associated with
     * this user with the provided token, it'll revoke it, otherwise it'll be a
     * no-op.
     */
    public async logout(token: string): Promise<void> {
        const accessToken = await this.getAccessToken(token);
        if (accessToken && !accessToken.expired()) await accessToken.revoke();
    }

    /**
     * globalLogout
     *
     * Revokes all active access tokens of the user so that she's logged out of
     * all devices she's currently logged in.
     */
    public async globalLogout(): Promise<void> {
        const accessTokens = await this.getActiveAccessTokens();
        for (const accessToken of accessTokens) {
            await accessToken.revoke();
        }
    }
}

import crypto from 'crypto';
import {AccessToken, RefreshToken} from './index';

export default abstract class User {
    public abstract id: number;
    public abstract username: string;
    public abstract password: string;
    public abstract createdAt: Date;
    public abstract updatedAt: Date;

    public static create(): Promise<User> {
        throw new Error('Not implemented');
    }
    public abstract remove(): Promise<void>;
    public abstract save(): Promise<void>;
    public static get({id, username}: {
        id?: number;
        username?: string;
    }): Promise<User> {
        throw new Error('Not implemented');
    }

    public abstract getAccessToken(token: string): Promise<AccessToken>;
    public abstract getAccessTokens(): Promise<AccessToken[]>;
    public abstract getActiveAccessTokens(): Promise<AccessToken[]>;
    public abstract getRefreshTokens(): Promise<RefreshToken[]>;
    public abstract getActiveRefreshTokens(): Promise<RefreshToken[]>;

    /**
     * hashPassword
     *
     * Takes a password and returns a salted hash of it
     *
     * @static
     * @param {string} password
     * @returns {string}
     */
    public static hashPassword(password: string): string {
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

    public async setPassword(password: string): Promise<void> { // TODO: config
        this.password = User.hashPassword(password);
        return await this.save();
    }

    public checkPassword(password: string): boolean {
        return this.password === User.hashPassword(password);
    }

    public static async authenticate(
        username: string,
        password: string,
    ): Promise<User|null> {
        const user = await User.get({username});
        if (!user) {
            User.hashPassword(password);
            return null;
        }
        if (!user.checkPassword(password)) {
            return null;
        }
        return user;
    }

    public async logout(token: string): Promise<void> {
        const accessToken = await this.getAccessToken(token);
        if (accessToken) await accessToken.revoke();
    }

    public async globalLogout(): Promise<void> {
        const accessTokens = await this.getActiveAccessTokens();
        for (const accessToken of accessTokens) {
            await accessToken.revoke();
        }
    }
}

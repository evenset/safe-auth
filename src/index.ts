import crypto from 'crypto';

export abstract class AccessToken {
    public abstract id: number;

    public revoke(): Promise<void> {
        return new Promise((): void => {});
    }
}

export abstract class RefreshToken {
    public abstract id: number;
}

export abstract class User {
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
        id: number|undefined;
        username: string|undefined;
    }): Promise<User> {
        throw new Error('Not implemented');
    }

    public abstract getAccessToken(token: string): Promise<AccessToken>;
    public abstract getAccessTokens(): Promise<AccessToken[]>;
    public abstract getActiveAccessTokens(): Promise<AccessToken[]>;
    public abstract getRefreshTokens(): Promise<RefreshToken[]>;
    public abstract getActiveRefreshTokens(): Promise<RefreshToken[]>;

    private static hashPassword(password: string): string {
        const algorithm = 'sha256';
        const iterations = 240000;
        const keyLength = 32;
        const salt = crypto.randomBytes(16);
        const hash = crypto.pbkdf2Sync(
            password,
            salt,
            iterations,
            keyLength,
            algorithm,
        ).toString('base64');
        return `${algorithm}$${iterations}$${salt}$${hash}`;
    }

    public setPassword(password: string): Promise<void> { // TODO: config
        this.password = User.hashPassword(password);
        return this.save();
    }

    public checkPassword(password: string): boolean {
        return this.password === User.hashPassword(password);
    }

    public static async login(
        username: string,
        password: string,
    ): Promise<User|null> {
        const user = await User.get({id: undefined, username});
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
        return await accessToken.revoke();
    }

    public async globalLogout(): Promise<void> {
        const accessTokens = await this.getActiveAccessTokens();
        for (const accessToken of accessTokens) {
            accessToken.revoke();
        }
    }
}

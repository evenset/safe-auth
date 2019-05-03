export {default as User} from './user';

export abstract class AccessToken {
    public abstract token: string;

    public static get({token, userId, expired}: {
        token: string;
        userId?: number;
        expired?: boolean;
    }): Promise<AccessToken> {
        throw new Error('Not implemented');
    }

    public static filter({userId, expired}: {
        userId?: number;
        expired?: boolean;
    }): Promise<AccessToken[]> {
        throw new Error('Not implemented');
    }

    public expired(): boolean {
        return false;
    }

    public revoke(): Promise<void> {
        return new Promise((): void => {});
    }
}

export abstract class RefreshToken {
    public static get({token, userId, consumed}: {
        token: string;
        userId?: number;
        consumed?: boolean;
    }): Promise<RefreshToken> {
        throw new Error('Not implemented');
    }

    public static filter({userId, consumed}: {
        userId?: number;
        consumed?: boolean;
    }): Promise<RefreshToken[]> {
        throw new Error('Not implemented');
    }
}

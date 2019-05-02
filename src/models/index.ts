export {default as User} from './user';

export abstract class AccessToken {
    public abstract id: number;
    public abstract token: string;

    public revoke(): Promise<void> {
        return new Promise((): void => {});
    }
}

export abstract class RefreshToken {
    public abstract id: number;
}

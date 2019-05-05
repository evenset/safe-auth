export default abstract class RefreshToken {
    public static first({token, userId, consumed}: {
        token: string;
        userId?: number;
        consumed?: boolean;
    }): Promise<RefreshToken|null> {
        throw new Error('Not implemented');
    }

    public static filter({userId, consumed}: {
        userId?: number;
        consumed?: boolean;
    }): Promise<RefreshToken[]> {
        throw new Error('Not implemented');
    }
}

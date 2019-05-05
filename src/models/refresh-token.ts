export default abstract class RefreshToken {
    /**
     * save
     *
     * Saves the RefreshToken instance in databse
     */
    public abstract save(): Promise<void>;

    /**
     * first
     *
     * Looks an RefreshToken up in database based on its token, accessTokenId,
     * userId or consumed attributes
     */
    public static first({token, accessTokenId, userId, consumed}: {
        token?: string;
        accessTokenId?: number;
        userId?: number;
        consumed?: boolean;
    }): Promise<RefreshToken|null> {
        throw new Error('Not implemented');
    }

    /**
     * filter
     *
     * Looks up RefreshTokens in database based on their userId or consumed
     * attributes
     */
    public static filter({userId, consumed}: {
        userId?: number;
        consumed?: boolean;
    }): Promise<RefreshToken[]> {
        throw new Error('Not implemented');
    }

    /**
     * remove
     *
     * Removes the RefreshToken from database
     */
    public abstract remove(): Promise<void>;
}

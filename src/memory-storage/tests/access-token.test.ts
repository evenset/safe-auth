import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import each from 'jest-each';

import {MemoryAccessToken, MemoryUser} from '..';

chai.use(sinonChai);
const expect = chai.expect;

afterEach((): void => {
    MemoryAccessToken.items = {};
    sinon.restore();
});

describe('StoredAccessToken class', (): void => {
    it('should exist', (): void => {
        expect(MemoryAccessToken)
            .to.exist;
    });

    it('should be constructable', (): void => {
        const user = new Object as MemoryUser;
        const expires = new Date();
        const accessToken = new MemoryAccessToken({user, expires});

        expect(accessToken)
            .to.have.property('user')
            .that.is.equal(user);
        expect(accessToken)
            .to.have.property('expires')
            .that.is.a('Date')
            .that.is.equal(expires);
    });

    it('should be able to save instances which includes generating an id for'
        + ' them', (): void => {
        const user = new Object as MemoryUser;
        const expires = new Date();
        const accessToken = new MemoryAccessToken({user, expires});
        accessToken.save();

        expect(accessToken)
            .to.have.property('id')
            .that.is.a('number');
    });

    it('should be able to remove instances which includes unsetting their id'
        + ' attribute', (): void => {
        const user = new Object as MemoryUser;
        const expires = new Date();
        const accessToken = new MemoryAccessToken({user, expires});
        accessToken.save();

        expect(accessToken)
            .to.have.property('id')
            .that.is.a('number');

        accessToken.remove();

        expect(accessToken)
            .to.have.property('id')
            .that.is.undefined;
    });

    describe('should implement a "first" method that looks up an' +
        ' "AccessToken" in database based on its token and optionally user id' +
        ' or expiration status.', (): void => {
        const firstUser = new Object({id: 1}) as MemoryUser;
        const secondUser = new Object({id: 2}) as MemoryUser;
        const thirdUser = new Object({id: 3}) as MemoryUser;
        const past = new Date(new Date().getTime() - 10 * 60 * 1000);
        const future = new Date(new Date().getTime() + 10 * 60 * 1000);
        const accessTokens = [
            new MemoryAccessToken({user: firstUser, expires: past}),
            new MemoryAccessToken({user: firstUser, expires: future}),
            new MemoryAccessToken({user: secondUser, expires: past}),
            new MemoryAccessToken({user: secondUser, expires: future}),
        ];
        (accessTokens[2] as any).consumed = true;
        each([
            [accessTokens[0], {token: accessTokens[0].token}, accessTokens],
            [accessTokens[1], {token: accessTokens[1].token}, accessTokens],
            [
                accessTokens[0],
                {token: accessTokens[0].token, userId: firstUser.id},
                accessTokens,
            ],
            [
                null,
                {token: accessTokens[0].token, userId: thirdUser.id},
                accessTokens,
            ],
            [
                accessTokens[0],
                {token: accessTokens[0].token, isExpired: true},
                accessTokens,
            ],
            [
                null,
                {token: accessTokens[0].token, isExpired: false},
                accessTokens,
            ],
            [
                accessTokens[0],
                {
                    token: accessTokens[0].token,
                    isExpired: true,
                    userId: firstUser.id,
                },
                accessTokens,
            ],
            [
                accessTokens[2],
                {
                    token: accessTokens[2].token,
                    isConsumed: true,
                    userId: secondUser.id,
                },
                accessTokens,
            ],
            [
                accessTokens[1],
                {
                    token: accessTokens[1].token,
                    isActive: true,
                    userId: firstUser.id,
                },
                accessTokens,
            ],
        ]).it('Should return %s for query %s', async (
            expected,
            query,
            accessTokens,
        ): Promise<void> => {
            await Promise.all(accessTokens.map(
                async (accessToken: MemoryAccessToken): Promise<void> =>
                    await accessToken.save(),
            ));
            const result = await MemoryAccessToken.first(query);

            expect(result).to.be.equal(expected);
        });
    });

    describe('should implement a "filter" method that returns "AccessToken"' +
        ' from database based on their user id or expiration status' +
        '', (): void => {
        const firstUser = new Object({id: 1}) as MemoryUser;
        const secondUser = new Object({id: 2}) as MemoryUser;
        const thirdUser = new Object({id: 3}) as MemoryUser;
        const past = new Date(new Date().getTime() - 10 * 60 * 1000);
        const future = new Date(new Date().getTime() + 10 * 60 * 1000);
        const accessTokens = [
            new MemoryAccessToken({user: firstUser, expires: past}),
            new MemoryAccessToken({user: firstUser, expires: future}),
            new MemoryAccessToken({user: secondUser, expires: past}),
            new MemoryAccessToken({user: secondUser, expires: future}),
        ];
        (accessTokens[2] as any).consumed = true;
        each([
            [accessTokens, {}, accessTokens],
            [
                [accessTokens[0], accessTokens[1]],
                {userId: firstUser.id},
                accessTokens,
            ],
            [[], {userId: thirdUser.id}, accessTokens],
            [
                [accessTokens[0], accessTokens[2]],
                {isExpired: true},
                accessTokens,
            ],
            [
                [accessTokens[1], accessTokens[3]],
                {isExpired: false},
                accessTokens,
            ],
            [
                [accessTokens[0]],
                {isExpired: true, userId: firstUser.id},
                accessTokens,
            ],
            [
                [accessTokens[3]],
                {isConsumed: false, userId: secondUser.id},
                accessTokens,
            ],
            [
                [accessTokens[1]],
                {isActive: true, userId: firstUser.id},
                accessTokens,
            ],
        ]).it('Should return %s for query %s', async (
            expected,
            query,
            accessTokens,
        ): Promise<void> => {
            await Promise.all(accessTokens.map(
                async (accessToken: MemoryAccessToken): Promise<void> =>
                    await accessToken.save(),
            ));
            const result = await MemoryAccessToken.filter(query);

            expect(result).to.be.deep.equal(expected);
        });
    });
});

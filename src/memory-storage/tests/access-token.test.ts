import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import each from 'jest-each';

import {AccessToken, User} from '..';

chai.use(sinonChai);
const expect = chai.expect;

afterEach((): void => {
    AccessToken.items = {};
    sinon.restore();
});

describe('AccessToken', (): void => {
    it('should exist', (): void => {
        expect(AccessToken)
            .to.exist;
    });

    it('should be constructable', (): void => {
        const user = new Object as User;
        const expires = new Date();
        const accessToken = new AccessToken({user, expires});

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
        const user = new Object as User;
        const expires = new Date();
        const accessToken = new AccessToken({user, expires});
        accessToken.save();

        expect(accessToken)
            .to.have.property('id')
            .that.is.a('number');
    });

    it('should be able to remove instances which includes unsetting their id'
        + ' attribute', (): void => {
        const user = new Object as User;
        const expires = new Date();
        const accessToken = new AccessToken({user, expires});
        accessToken.save();

        expect(accessToken)
            .to.have.property('id')
            .that.is.a('number');

        accessToken.remove();

        expect(accessToken)
            .to.have.property('id')
            .that.is.equal(undefined);
    });

    describe('should implement a "get" method that looks up an "AccessToken"' +
        ' in database based on its token and optionally user id or expiration' +
        ' status.', (): void => {
        const firstUser = new Object({id: 1}) as User;
        const secondUser = new Object({id: 2}) as User;
        const thirdUser = new Object({id: 3}) as User;
        const past = new Date(new Date().getTime() - 10 * 60 * 1000);
        const future = new Date(new Date().getTime() + 10 * 60 * 1000);
        const accessTokens = [
            new AccessToken({user: firstUser, expires: past}),
            new AccessToken({user: firstUser, expires: future}),
            new AccessToken({user: secondUser, expires: past}),
            new AccessToken({user: secondUser, expires: future}),
        ];
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
                {token: accessTokens[0].token, expired: true},
                accessTokens,
            ],
            [
                null,
                {token: accessTokens[0].token, expired: false},
                accessTokens,
            ],
            [
                accessTokens[0],
                {
                    token: accessTokens[0].token,
                    expired: true,
                    userId: firstUser.id,
                },
                accessTokens,
            ],
            [
                null,
                {
                    token: accessTokens[0].token,
                    expired: false,
                    userId: secondUser.id,
                },
                accessTokens,
            ],
            [
                accessTokens[1],
                {
                    token: accessTokens[1].token,
                    expired: false,
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
                async (accessToken: AccessToken): Promise<void> =>
                    await accessToken.save(),
            ));
            const result = await AccessToken.first(query);

            expect(result).to.be.equal(expected);
        });
    });

    describe('should implement a "filter" method that returns "AccessToken"' +
        ' from database based on their user id or expiration status' +
        '', (): void => {
        const firstUser = new Object({id: 1}) as User;
        const secondUser = new Object({id: 2}) as User;
        const thirdUser = new Object({id: 3}) as User;
        const past = new Date(new Date().getTime() - 10 * 60 * 1000);
        const future = new Date(new Date().getTime() + 10 * 60 * 1000);
        const accessTokens = [
            new AccessToken({user: firstUser, expires: past}),
            new AccessToken({user: firstUser, expires: future}),
            new AccessToken({user: secondUser, expires: past}),
            new AccessToken({user: secondUser, expires: future}),
        ];
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
                {expired: true},
                accessTokens,
            ],
            [
                [accessTokens[1], accessTokens[3]],
                {expired: false},
                accessTokens,
            ],
            [
                [accessTokens[0]],
                {expired: true, userId: firstUser.id},
                accessTokens,
            ],
            [
                [accessTokens[3]],
                {expired: false, userId: secondUser.id},
                accessTokens,
            ],
            [
                [accessTokens[1]],
                {expired: false, userId: firstUser.id},
                accessTokens,
            ],
        ]).it('Should return %s for query %s', async (
            expected,
            query,
            accessTokens,
        ): Promise<void> => {
            await Promise.all(accessTokens.map(
                async (accessToken: AccessToken): Promise<void> =>
                    await accessToken.save(),
            ));
            const result = await AccessToken.filter(query);

            expect(result).to.be.deep.equal(expected);
        });
    });
});

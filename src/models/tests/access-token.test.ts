import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import each from 'jest-each';

import AccessToken from '../access-token';
import {User} from '..';

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

afterEach((): void => sinon.restore());

class DummyAccessToken extends AccessToken {
    public id = 1;
    public createdAt = new Date();
    public updatedAt = new Date();

    public remove(): Promise<void> {
        return new Promise((): void => {});
    }

    public save(): Promise<void> {
        return new Promise((): void => {});
    }
}

class DummyUser extends User {
    public static AccessTokenClass = DummyAccessToken;

    public id = 1;
    public createdAt = new Date();
    public updatedAt = new Date();

    public remove(): Promise<void> {
        return new Promise((resolve): void => resolve());
    }

    public save(): Promise<void> {
        return new Promise((resolve): void => resolve());
    }
}

describe('AccessToken class', (): void => {
    it('should exist', (): void => {
        expect(AccessToken)
            .to.exist;
    });

    it('should define but not implement "first" static method' +
        '', async (): Promise<void> => {
        expect(AccessToken.first)
            .to.be.a('function');
        await expect(AccessToken.first({token: 'token'}))
            .to.be.rejectedWith(
                '"first" method is not implemented for "AccessToken"',
            );
    });

    it('should define but not implement "filter" static method' +
        '', async (): Promise<void> => {
        expect(AccessToken.filter)
            .to.be.a('function');
        await expect(AccessToken.filter({}))
            .to.be.rejectedWith(
                '"filter" method is not implemented for "AccessToken"',
            );
    });

    each([
        ['future', true, false],
        ['future', false, true],
        ['past', true, false],
        ['past', false, false],
    ]).it('should implement "isActive" method that for expires set to "%s"' +
        ' and consumed set to "%s" returns "%s"',
    (expires, consumed, expected): void => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});
        const accessToken = new DummyAccessToken({
            user,
            expires: expires === 'future'
                ? new Date(new Date().getTime() + 10 * 60 * 1000)
                : new Date(new Date().getTime() - 10 * 60 * 1000),
        });
        (accessToken as any).consumed = consumed;
        expect(accessToken.isActive)
            .to.be.a('function');

        const result = accessToken.isActive();

        expect(result)
            .to.be.equal(expected);
    });

    each([
        ['future', false],
        ['past', true],
        [null, true],
    ]).it('should implement "isExpired" method that for expires set to "%s"' +
        ' returns "%s"', (expires, expected): void => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});
        const accessToken = new DummyAccessToken({
            user,
            expires: expires === 'future'
                ? new Date(new Date().getTime() + 10 * 60 * 1000)
                : expires === 'past'
                    ? new Date(new Date().getTime() - 10 * 60 * 1000)
                    : null,
        });
        expect(accessToken.isExpired)
            .to.be.a('function');

        const result = accessToken.isExpired();

        expect(result)
            .to.be.equal(expected);
    });

    it('should define implement "revoke" method that removes the access token' +
        '', (): void => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});
        const accessToken = new DummyAccessToken({
            user,
            expires: new Date(new Date().getTime() + 10 * 60 * 1000),
        });

        expect(accessToken.revoke)
            .to.be.a('function');

        sinon.replace(accessToken, 'remove', sinon.fake());

        accessToken.revoke();

        expect(accessToken.remove)
            .to.be.calledOnce;
    });

    it('should implement an "issue" static method that generates token' +
        ' for a user', async (): Promise<void> => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});

        expect(AccessToken.issue)
            .to.be.a('function');

        sinon.replace(DummyAccessToken.prototype, 'save', sinon.fake());

        const result = await DummyAccessToken.issue(user);

        expect(result)
            .to.be.an.instanceOf(AccessToken);
        expect(result.save)
            .to.be.calledOnce;
    });

    each([
        ['exists', true, 'active', 'the user'],
        ['exists', false, 'active', null],
        ['doesn\'t exist', true, 'active', null],
        ['doesn\'t exist', false, 'active', null],
        ['exists', true, 'inactive', 'the user'],
        ['exists', false, 'inactive', null],
        ['doesn\'t exist', true, 'inactive', null],
        ['doesn\'t exist', false, 'inactive', null],
    ]).it('should implement an "authenticate" static method that takes a' +
        ' token string and returns associated user. If AccessToken matching' +
        ' the token "%s" and its active status is "%s" and the associated' +
        ' user is "%s" it should return "%s"' +
        '', async (existence, activeStatus, isActive, expected): Promise<void> => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});
        user.isActive = isActive;

        expect(AccessToken.issue)
            .to.be.a('function');

        sinon.replace(
            AccessToken,
            'first',
            async (_: any): Promise<AccessToken|null> => {
                if (existence === 'exists') {
                    const accessToken = new DummyAccessToken({
                        user,
                        expires: new Date(
                            new Date().getTime() + 10 * 60 * 1000,
                        ),
                    });
                    sinon.replace(
                        accessToken,
                        'isActive',
                        (): boolean => activeStatus,
                    );
                    return accessToken;
                }
                else
                    return null;
            },
        );

        const result = await AccessToken.authenticate('some-token');

        expect(result)
            .to.be.equal(expected === 'the user' ? user : null);
    });

    describe('"refreshToken" static method', (): void => {
        it('should generate new token for a user when provided an active' +
            ' token of that user, it should consume the old token too' +
            '', async (): Promise<void> => {
            const username = 'username';
            const password = 'password';
            const user = new DummyUser({username, password});
            user.isActive = true;
            const accessToken = new DummyAccessToken({
                user,
                expires: new Date(
                    new Date().getTime() + 10 * 60 * 1000,
                ),
            });

            expect(AccessToken.refreshToken)
                .to.be.a('function');

            sinon.replace(
                DummyAccessToken,
                'first',
                sinon.fake.returns(accessToken),
            );
            sinon.replace(DummyAccessToken.prototype, 'save', sinon.fake());

            const result = await DummyAccessToken.refreshToken(
                accessToken.refreshToken,
            );

            expect(result)
                .to.be.an.instanceOf(AccessToken);
            expect(DummyAccessToken.prototype.save)
                .to.be.calledTwice;
        });

        it('should do nothing and return null when provided an invalid token' +
            '', async (): Promise<void> => {
            expect(AccessToken.refreshToken)
                .to.be.a('function');

            sinon.replace(
                DummyAccessToken,
                'first',
                sinon.fake.returns(null),
            );
            sinon.replace(DummyAccessToken.prototype, 'save', sinon.fake());

            const result = await DummyAccessToken.refreshToken('invalid-token');

            expect(result)
                .to.be.null;
            expect(DummyAccessToken.prototype.save)
                .to.not.be.called;
        });

        it('should do nothing and return null when the user is inactive' +
            '', async (): Promise<void> => {
            const username = 'username';
            const password = 'password';
            const user = new DummyUser({username, password});
            const accessToken = new DummyAccessToken({
                user,
                expires: new Date(
                    new Date().getTime() + 10 * 60 * 1000,
                ),
            });

            expect(AccessToken.refreshToken)
                .to.be.a('function');

            sinon.replace(
                DummyAccessToken,
                'first',
                sinon.fake.returns(accessToken),
            );
            sinon.replace(DummyAccessToken.prototype, 'save', sinon.fake());

            const result = await DummyAccessToken.refreshToken(
                accessToken.refreshToken,
            );

            expect(result)
                .to.be.null;
            expect(DummyAccessToken.prototype.save)
                .to.not.be.called;
        });
    });
});

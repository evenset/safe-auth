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
        return new Promise((): void => {});
    }

    public save(): Promise<void> {
        return new Promise((): void => {});
    }
}

afterEach((): void => sinon.restore());

describe('AccessToken class', (): void => {
    it('should exist', (): void => {
        expect(AccessToken)
            .to.exist;
    });

    it('should define but not implement "first" static method', (): void => {
        expect(AccessToken.first)
            .to.be.a('function');
        expect(AccessToken.first({token: 'token'}))
            .to.be.rejectedWith('Not implemented');
    });

    it('should define but not implement "filter" static method', (): void => {
        expect(AccessToken.filter)
            .to.be.a('function');
        expect(AccessToken.filter({}))
            .to.be.rejectedWith('Not implemented');
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

    it('should implement an "issue" method that generates token' +
        ' passwords', async (): Promise<void> => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});

        expect(AccessToken.issue)
            .to.be.a('function');

        const result = await DummyAccessToken.issue(user);

        expect(result)
            .to.be.an.instanceOf(AccessToken);
    });

    each([
        ['exists', true, 'the user'],
        ['exists', false, null],
        ['doesn\'t exist', true, null],
        ['doesn\'t exist', false, null],
    ]).it('should implement an "authenticate" static method that takes a' +
        ' token string and returns associated user. If AccessToken matching' +
        ' the token "%s" and its active status is "%s" it should return "%s"' +
        '', async (existence, activeStatus, expected): Promise<void> => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});

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
});

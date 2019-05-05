import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import crypto from 'crypto';

import User from '../user';
import {AccessToken} from '..';

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

describe('User class', (): void => {
    it('should exist', (): void => {
        expect(User)
            .to.exist;
    });

    it('should define but not implement "first" static method', (): void => {
        expect(User.first)
            .to.be.a('function');
        expect(User.first({id: 1}))
            .to.be.rejectedWith('Not implemented');
    });

    it('should implement "getAccessToken" method', (): void => {
        const username = 'username';
        const password = 'password';
        const token = 'token';
        const user = new DummyUser({username, password});
        expect(user.getAccessToken)
            .to.be.a('function');
        sinon.replace(DummyAccessToken, 'first', sinon.fake());

        user.getAccessToken(token);

        expect(DummyAccessToken.first)
            .to.be.calledOnceWith({token, userId: user.id});
    });

    it('should implement "getAccessTokens" method', (): void => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});
        expect(user.getAccessTokens)
            .to.be.a('function');
        sinon.replace(DummyAccessToken, 'filter', sinon.fake());

        user.getAccessTokens();

        expect(DummyAccessToken.filter)
            .to.be.calledOnceWith({userId: user.id});
    });

    it('should implement "getAccessToken" method', (): void => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});
        expect(user.getActiveAccessTokens)
            .to.be.a('function');
        sinon.replace(DummyAccessToken, 'filter', sinon.fake());

        user.getActiveAccessTokens();

        expect(DummyAccessToken.filter)
            .to.be.calledOnceWith({active: true, userId: user.id});
    });

    describe('hashPassword method', (): void => {
        it('hashes passwords with random salt when called with single' +
            ' argument', (): void => {
            expect(User.hashPassword)
                .to.be.a('function');

            const password = 'password';
            const algorithm = 'sha256';
            const iterations = 240000;
            const keyLength = 32;

            const result = User.hashPassword(password);

            const salt = result.split('$')[2];
            const hash = crypto.pbkdf2Sync(
                password,
                salt,
                iterations,
                keyLength,
                algorithm,
            ).toString('base64');
            const expectedHashedPassword =
                `${algorithm}$${iterations}$${salt}$${hash}`;
            expect(result)
                .to.be.equal(expectedHashedPassword);
        });

        it('hashes passwords with given salt when called with two arguments' +
            '', (): void => {
            expect(User.hashPassword)
                .to.be.a('function');

            const password = 'password';
            const algorithm = 'sha256';
            const iterations = 240000;
            const keyLength = 32;
            const salt = crypto.randomBytes(9).toString('base64');

            const result = User.hashPassword(password, salt);

            const hash = crypto.pbkdf2Sync(
                password,
                salt,
                iterations,
                keyLength,
                algorithm,
            ).toString('base64');
            const expectedHashedPassword =
                `${algorithm}$${iterations}$${salt}$${hash}`;
            expect(result)
                .to.be.equal(expectedHashedPassword);
        });
    });

    it('should implement a "setPassword" method that sets the salted hashed' +
        ' password as password field of the instance' +
        '', async (): Promise<void> => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});
        sinon.replace(User, 'hashPassword', sinon.fake.returns('hashed'));
        sinon.replace(user, 'save', sinon.fake());

        await user.setPassword(password);

        expect(User.hashPassword)
            .to.have.been.calledOnceWith(password);
        expect(user.save)
            .to.have.been.calledOnce;
        expect(user.password)
            .to.be.equal('hashed');
    });

    it('should implement a "checkPassword" method that takes a password and' +
        ' returns true iff it matches the user\'s password', (): void => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});

        sinon.spy(User, 'hashPassword');

        const result = user.checkPassword(password);

        expect(User.hashPassword)
            .to.have.been.calledOnceWith(password);
        expect(result)
            .to.be.ok;
    });

    it('should implement an "authenticate" method that takes a username and a' +
        ' password and returns the matching user if credentials are valid' +
        '', async (): Promise<void> => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});

        sinon.replace(User, 'first', sinon.fake(
            ({username}: {username: string}): User|null => {
                if (username === user.username)
                    return user;
                return null;
            },
        ));
        sinon.spy(User, 'hashPassword');

        const result = await User.authenticate(username, password);

        expect(User.first)
            .to.have.been.calledOnceWith({username});
        expect(User.hashPassword)
            .to.have.been.calledOnceWith(password);
        expect(result)
            .to.be.equal(user);
    });

    it('should implement an "authenticate" method that takes a username and a' +
        ' password and returns null if credentials aren\'t valid' +
        '', async (): Promise<void> => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});

        sinon.replace(User, 'first', sinon.fake(
            ({username}: {username: string}): User|null => {
                if (username === user.username)
                    return user;
                return null;
            },
        ));

        const result = await User.authenticate(username, 'invalid-password');

        expect(User.first)
            .to.have.been.calledOnceWith({username});
        expect(result)
            .to.be.equal(null);
    });

    it('should implement an "authenticate" method that takes a username and a' +
        ' password and return the matching password if any or null otherwise' +
        '', async (): Promise<void> => {
        const username = 'username';
        const password = 'password';
        const user = new DummyUser({username, password});

        sinon.replace(User, 'first', sinon.fake(
            ({username}: {username: string}): User|null => {
                if (username === user.username)
                    return user;
                return null;
            },
        ));

        const result = await User.authenticate('invalid-username', password);

        expect(User.first)
            .to.have.been.calledOnceWith({username: 'invalid-username'});
        expect(result)
            .to.be.equal(null);
    });

    it('should implement a "logout" method that takes an access token string' +
        ' and in case it\'s an active access token of the user, it should' +
        ' revoke it', async (): Promise<void> => {
        const token = 'some-token';
        const user = new DummyUser({
            username: 'username',
            password: 'password',
        });
        const accessToken: AccessToken = {
            token,
            revoke: sinon.fake(),
            isActive: (): boolean => true,
        } as unknown as AccessToken;
        sinon.replace(user, 'getAccessToken', sinon.fake(
            (token: string): AccessToken|null => {
                if (token === accessToken.token)
                    return accessToken;
                return null;
            },
        ));

        await user.logout(token);

        expect(user.getAccessToken)
            .to.have.been.calledOnceWith(token);
        expect(accessToken.revoke)
            .to.have.been.calledOnce;
    });

    it('should implement a "globalLogout" method that revokes all active' +
        ' access tokens of the user', async (): Promise<void> => {
        const user = new DummyUser({
            username: 'username',
            password: 'password',
        });
        const accessTokens: AccessToken[] = [
            {token: '0', revoke: sinon.fake(), user},
            {token: '1', revoke: sinon.fake(), user},
            {token: '2', revoke: sinon.fake(), user},
        ] as unknown as AccessToken[];
        sinon.replace(user, 'getActiveAccessTokens', sinon.fake(
            (): AccessToken[] => {
                return accessTokens;
            },
        ));

        await user.globalLogout();

        expect(user.getActiveAccessTokens)
            .to.have.been.calledOnce;
        for (const accessToken of accessTokens)
            expect(accessToken.revoke)
                .to.have.been.calledOnce;
    });
});

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {AccessToken, User} from '../memory-storage/index';

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

afterEach((): void => {
    sinon.restore();
    User.items = {};
    AccessToken.items = {};
});

describe('Normal flow', (): void => {
    it('Should be able to create a user, authenticate her, issue an access' +
        ' token for her and authenticate the access token, each of these' +
        ' steps should return null when the previous steps aren\'t done yet' +
        ' or when called with invalid arguments', async (): Promise<void> => {
        expect(await User.authenticate('u', 'p'))
            .to.be.null;
        const user = new User({username: 'u', password: 'p'});
        expect(await User.authenticate('u', 'p'))
            .to.be.null;
        await user.save();
        expect(await User.authenticate('u', 'p'))
            .to.be.equal(user);

        expect(await AccessToken.authenticate('some-token'))
            .to.be.null;
        const accessToken = await AccessToken.issue(user);
        expect(await AccessToken.authenticate('some-token'))
            .to.be.null;
        expect(await AccessToken.authenticate(accessToken.refreshToken))
            .to.be.null;
        expect(await AccessToken.authenticate(accessToken.token))
            .to.be.equal(user);
    });
});

describe('Refreshing token', (): void => {
    it('Should be able to create a user, issue an access token for her and' +
        ' refresh that token (consuming old one). Refreshing token should' +
        ' return null called with invalid token', async (): Promise<void> => {
        const user = new User({username: 'u', password: 'p'});
        await user.save();

        const accessToken = await AccessToken.issue(user);
        expect(await AccessToken.refreshToken('some-token'))
            .to.be.null;
        expect(await AccessToken.refreshToken(accessToken.token))
            .to.be.null;

        const result = await AccessToken.refreshToken(accessToken.refreshToken);
        expect(result)
            .to.be.an.instanceOf(AccessToken);
        expect(accessToken.isConsumed()).to.be.true;
    });
});

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {MemoryAccessToken, MemoryUser} from '../memory-storage/index';

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

afterEach((): void => {
    sinon.restore();
    MemoryUser.items = {};
    MemoryAccessToken.items = {};
});

describe('Normal flow', (): void => {
    it('Should be able to create a user, authenticate her, issue an access' +
        ' token for her and authenticate the access token, each of these' +
        ' steps should return null when the previous steps aren\'t done yet' +
        ' or when called with invalid arguments', async (): Promise<void> => {
        expect(await MemoryUser.authenticate('u', 'p'))
            .to.be.null;
        const user = new MemoryUser({username: 'u', password: 'p'});
        expect(await MemoryUser.authenticate('u', 'p'))
            .to.be.null;
        await user.save();
        expect(await MemoryUser.authenticate('u', 'p'))
            .to.be.equal(null);
        user.isActive = true;
        // Event though saving is not required in memory storage backend it's
        // here to keep the code snippet a valid sample for all storage backends
        await user.save();
        expect(await MemoryUser.authenticate('u', 'p'))
            .to.be.equal(user);

        expect(await MemoryAccessToken.authenticate('some-token'))
            .to.be.null;
        const accessToken = await MemoryAccessToken.issue(user);
        expect(await MemoryAccessToken.authenticate('some-token'))
            .to.be.null;
        expect(await MemoryAccessToken.authenticate(accessToken.refreshToken))
            .to.be.null;

        user.isActive = false;
        // Event though saving is not required in memory storage backend it's
        // here to keep the code snippet a valid sample for all storage backends
        user.save();
        expect(await MemoryAccessToken.authenticate(accessToken.token))
            .to.be.null;
        user.isActive = true;
        // Event though saving is not required in memory storage backend it's
        // here to keep the code snippet a valid sample for all storage backends
        user.save();
        expect(await MemoryAccessToken.authenticate(accessToken.token))
            .to.be.equal(user);
    });
});

describe('Refreshing token', (): void => {
    it('Should be able to create a user, issue an access token for her and' +
        ' refresh that token (consuming old one). Refreshing token should' +
        ' return null called with invalid token', async (): Promise<void> => {
        const user = new MemoryUser({username: 'u', password: 'p'});
        await user.save();

        const accessToken = await MemoryAccessToken.issue(user);
        expect(await MemoryAccessToken.refreshToken('some-token'))
            .to.be.null;
        expect(await MemoryAccessToken.refreshToken(accessToken.token))
            .to.be.null;

        expect(await MemoryAccessToken.refreshToken(accessToken.refreshToken))
            .to.be.null;
        user.isActive = true;
        // Event though saving is not required in memory storage backend it's
        // here to keep the code snippet a valid sample for all storage backends
        user.save();
        const result = await MemoryAccessToken.refreshToken(
            accessToken.refreshToken,
        );
        expect(result)
            .to.be.an.instanceOf(MemoryAccessToken);
        expect(accessToken.isConsumed())
            .to.be.true;
    });
});

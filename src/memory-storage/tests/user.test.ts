import chai from 'chai';
import faker from 'faker';

import {User} from '..';

const expect = chai.expect;

describe('AccessToken', (): void => {
    it('should exist', (): void => {
        expect(User)
            .to.exist;
    });

    it('should be constructable', (): void => {
        const username = faker.internet.userName();
        const password = faker.internet.password();
        const user = new User({username, password});

        expect(user)
            .to.have.property('username')
            .that.is.a('string')
            .that.is.equal(username);
        expect(user)
            .to.have.property('password')
            .that.is.a('string')
            .that.is.equal(password);
    });

    it('should be able to save instances which includes generating an id for'
        + ' them', (): void => {
        const username = faker.internet.userName();
        const password = faker.internet.password();
        const user = new User({username, password});
        user.save();

        expect(user)
            .to.have.property('id')
            .that.is.a('number');
    });
});

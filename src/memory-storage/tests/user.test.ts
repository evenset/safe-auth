import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import faker from 'faker';
import each from 'jest-each';

import {User} from '..';

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

afterEach((): void => {
    User.items = {};
    sinon.restore();
});

describe('StoredUser class', (): void => {
    it('should exist', (): void => {
        expect(User)
            .to.exist;
    });

    it('should be constructable', (): void => {
        sinon.replace(User, 'hashPassword', <T>(a: T): T => a);
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
            .that.satisfies((password: string): boolean =>
                (password.match(/\$/g) || []).length === 3);
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

    it('should be able to remove instances which includes unsetting their id'
        + ' attribute', (): void => {
        const username = faker.internet.userName();
        const password = faker.internet.password();
        const user = new User({username, password});
        user.save();

        expect(user)
            .to.have.property('id')
            .that.is.a('number');

        user.remove();

        expect(user)
            .to.have.property('id')
            .that.is.undefined;
    });

    describe('should implement a "first" method that looks up a "User"' +
        ' in database based on its token and optionally user id or expiration' +
        ' status.', (): void => {
        const users = [
            new User({username: 'user1', password: 'password'}),
            new User({username: 'user2', password: 'password'}),
            new User({username: 'user3', password: 'password'}),
        ];
        each([
            [users[0], {username: users[0].username}, users],
            [users[1], {username: users[1].username}, users],
            [users[2], {id: (): number => users[2].id}, users],
            [
                null,
                {id: (): number => users[0].id + users[1].id + users[2].id},
                users,
            ],
            [null, {username: 'invalid-username'}, users],
        ]).it('Should return %s for query %s', async (
            expected,
            query,
            users,
        ): Promise<void> => {
            if (query.id instanceof Function)
                query.id = query.id();
            await Promise.all(users.map(
                async (user: User): Promise<void> => await user.save(),
            ));
            const result = await User.first(query);

            expect(result)
                .to.be.equal(expected);
        });

        each([
            [{username: users[0].username, id: 1}],
            [{username: users[0].username, id: (): number => users[1].id}],
        ]).it('Should throw when both username and id parameters are set: %s' +
            '', async (query): Promise<void> => {
            if (query.id instanceof Function)
                query.id = query.id();
            await Promise.all(users.map(
                async (user: User): Promise<void> => await user.save(),
            ));

            expect(User.first(query))
                .to.be.rejectedWith(
                    'Either "id" or "username" should be provided.',
                );
        });
    });
});

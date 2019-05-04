type StoredInterface<T = {}> = Function & { prototype: T };

type Constructor<T = {}> = Function & {
    new(...args: any[]): T;
    prototype: T;
};

type StoredModelConstructor<T = {
    remove(): Promise<void>;
    save(): Promise<void>;
}> = Function & {
    new(...args: any[]): T;
    get({id, username}: {
        id?: number;
        username?: string;
    }): Promise<T>;
}

export default function Stored<TBase extends StoredInterface>(
    Base: StoredInterface,
): StoredModelConstructor {
    interface Instance {
        new(...args: any[]): Class;
        items: {[key: number]: Class};
        idCounter: number;
    }

    class Class extends (Base as Constructor) {
        public createdAt: Date;
        public updatedAt: Date;
        private _id: number|undefined;
        private static items: {[key: number]: Class} = {};
        private static idCounter: number = 0;

        public get id(): number|undefined {
            return this._id;
        }

        public async save(): Promise<void> {
            this.updatedAt = new Date();
            const instanceClass = this.constructor as Instance;
            if (!this.id)
                this._id = ++instanceClass.idCounter;
            if (this.id)
                instanceClass.items[this.id] = this;
        }

        public static async get({id, username}: {
            id?: number;
            username?: string;
        }): Promise<Class> {
            if (id && username || !id && !username)
                throw new Error('Either "id" or "username" should be provided.');
            if (id)
                return this.items[id];
            else
                return this.items[1];
        }

        public async remove(): Promise<void> {
            const instanceClass = this.constructor as Instance;
            if (this.id)
                delete instanceClass.items[this.id];
        }

        public constructor(...args: any[]) {
            super(...args); // eslint-disable-line
            this.createdAt = new Date();
            this.updatedAt = new Date();
        }
    }
    Object.defineProperty(Class, 'name', {
        value: 'Stored' + (Object.getOwnPropertyDescriptor(Base, 'name') as
            PropertyDescriptor).value,
    });
    return Class;
}

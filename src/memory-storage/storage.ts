type StoredInterface<T = {}> = Function & { prototype: T };

interface Constructor<T = {}> {
    new(...args: any[]): T;
    prototype: T;
}

interface StoredModelConstructor<T = {
    remove(): Promise<void>;
    save(): Promise<void>;
    id: number|undefined;
    createdAt: Date;
    updatedAt: Date;
}> {
    new(...args: any[]): T;
}


export default function Stored<T, TBase extends StoredInterface>(
    Base: TBase,
): T & {items: {[key: number]: T}} & StoredModelConstructor {
    type Instance = {
        new(...args: any[]): Class;
        items: {[key: number]: Class};
        idCounter: number;
    } & Class

    class Class extends (Base as unknown as Constructor) {
        public createdAt: Date;
        public updatedAt: Date;
        private _id: number|undefined;
        protected static items: {[key: number]: Class} = {};
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
    return Class as unknown as (
        T &
        {items: {[key: number]: T}} &
        StoredModelConstructor
    );
}

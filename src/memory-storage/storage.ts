type Interface<T = {}> = Function & { prototype: T };

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

/**
 * Stored mixin that implements storage methods of an abstract class of
 * safe-auth. It uses JS variables to store instances in memory.
 * It's mostly used for development purposes and not to be used for
 * production.
 */
export default function Stored<T, TBase extends Interface>(
    Base: TBase,
): TBase & {items: {[key: number]: T}} & StoredModelConstructor {
    type Instance = {
        new(...args: any[]): Class;
        items: {[key: number]: Class};
        idCounter: number;
    } & Class

    /**
     * Stored class that implements storage methods of an abstract class of
     * safe-auth. It uses JS variables to store instances in memory.
     * It's mostly used for development purposes and not to be used for
     * production.
     */
    class Class extends (Base as unknown as Constructor) {
        /**
         * Timestamp of the creation of the instance
         */
        public createdAt: Date|undefined;
        /**
         * Timestamp of the last update on the instance (last time save method has
         * been called)
         */
        public updatedAt: Date|undefined;
        private _id: number|undefined;
        private static items: {[key: number]: Class} = {};
        private static idCounter: number = 0;

        public get id(): number|undefined {
            return this._id;
        }

        /*
         * Keeps the reference of the instance in a JS memory.
         * WARNING: Modifying the instance after it's been saved will also
         * change the saved version as the saved version is not clone.
         */
        public async save(): Promise<void> {
            this.updatedAt = new Date();
            const instanceClass = this.constructor as Instance;
            if (!this.id) {
                this.createdAt = new Date();
                this._id = ++instanceClass.idCounter;
            }
            if (this.id)
                instanceClass.items[this.id] = this;
        }

        /*
         * Removes the reference to instance.
         */
        public async remove(): Promise<void> {
            const instanceClass = this.constructor as Instance;
            if (this.id) {
                delete instanceClass.items[this.id];
                this._id = undefined;
            }
        }
    }

    // Setting the class name so that if the name of the original base class
    // is "X" the generated class has the name of "StoredX"
    Object.defineProperty(Class, 'name', {
        value: 'Stored' + (Object.getOwnPropertyDescriptor(Base, 'name') as
            PropertyDescriptor).value,
    });
    return Class as unknown as (
        TBase &
        {items: {[key: number]: T}} &
        StoredModelConstructor
    );
}

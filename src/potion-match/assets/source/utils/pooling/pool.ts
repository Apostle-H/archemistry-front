export class Pool<T> {
    private factory: () => T;

    private _pool: T[] = []; 

    constructor(factory: () => T) {
        this.factory = factory;
    }

    public get(): T {
        if (this._pool.length < 1) {
            this.add();
        }

        return this._pool.shift();
    }

    public put(value: T) {
        this._pool.push(value);
    }

    private add() {
        const newItem = this.factory();

        this._pool.push(newItem);
    }
}
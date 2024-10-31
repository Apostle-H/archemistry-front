export class MapPool<K, T> {
    private _factory: (key: K) => T;
    private _onGet: (item: T) => void;
    private _onPut: (item: T) => void;

    private _pool: Map<K, T[]> = new Map<K, T[]>(); 

    constructor(factory: (key: K) => T, onGet: (item: T) => void, onPut: (item: T) => void) {
        this._factory = factory;
        this._onGet = onGet;
        this._onPut = onPut;
    }

    public get(key: K): T {
        if (!this._pool.has(key) || this._pool.get(key).length < 1) {
            return this._factory(key);
        }

        const getItem = this._pool.get(key).shift();
        this._onGet(getItem);
        return getItem;
    }

    public put(key: K, item: T) {
        if (!this._pool.has(key)) {
            this._pool.set(key, [])
        }

        this._onPut(item);
        this._pool.get(key).push(item);
    } 
}
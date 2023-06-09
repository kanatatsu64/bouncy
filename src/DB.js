class DB extends EventTarget {
    static available() {
        return !(window.indexedDB === undefined)
    }

    // schema = [{store: string, options: any}]
    constructor(name, version, schema) {
        super();
        this.name = name;
        this.version = version;
        this.schema = schema;
        this.db = null;
    }

    ready() {
        return !(this.db === null)
    }

    has(store) {
        const res = this.schema.find(({_store, _}) => (_store == store));
        return !(res === undefined)
    }

    destroy() {
        if (!DB.available()) {
            const msg = "IndexedDB is not available";
            throw new Error(msg);
        }
        window.indexedDB.deleteDatabase(this.name);
    }

    async connect() {
        return new Promise((resolve, reject) => {
            if (!DB.available()) {
                const msg = "IndexedDB is not available";
                reject(new Error(msg));
            }

            const request = window.indexedDB.open(this.name, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.schema.forEach(({store, options}) => {
                    db.createObjectStore(store, options); 
                });
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                this.db = db;
                resolve(db);
            };

            request.onerror = reject;
        });
    }

    async add(store, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(store, "readwrite");
            const request = transaction.objectStore(store).add(value);

            request.onsuccess = (event) => {
                event.stopPropagation();
                resolve(event);
            };
            request.onerror = (event) => {
                event.stopPropagation();
                reject(event);
            };
        });
    }

    async get(store, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(store, "readwrite");
            const request = transaction.objectStore(store).get(key);

            request.onsuccess = (event) => {
                event.stopPropagation();
                resolve(request.result);
            };
            request.onerror = (event) => {
                event.stopPropagation();
                reject(event);
            };
        });
    }

    async getAll(store) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(store, "readwrite");
            const request = transaction.objectStore(store).getAll();

            request.onsuccess = (event) => {
                event.stopPropagation();
                resolve(request.result);
            };
            request.onerror = (event) => {
                event.stopPropagation();
                reject(event);
            };
        });
    }

    async delete(store, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(store, "readwrite");
            const request = transaction.objectStore(store).delete(key);

            request.onsuccess = (event) => {
                event.stopPropagation();
                resolve(event);
            };
            request.onerror = (event) => {
                event.stopPropagation();
                reject(event);
            };
        });
    }
}

export default DB;

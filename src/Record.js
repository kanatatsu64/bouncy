import DB from "./DB.js"

class Record {
    static name = "BouncyDB";
    static version = 1;
    static store = "records";
    static schema = [{
        store: "records",
        options: {
            autoIncrement: true
        }
    }];

    constructor() {
        this.db = new DB(Record.name, Record.version, Record.schema);
    }

    async connect() {
        await this.db.connect();
    }

    async get(key) {
        return (await this.db.get(Record.store, key));
    }

    async list() {
        return (await this.db.getAll(Record.store));
    }

    async save(blob) {
        await this.db.add(Record.store, blob);
    }

    async delete(key) {
        await this.db.delete(Record.store, key);
    }
}

export default Record;

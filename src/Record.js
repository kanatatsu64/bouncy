import DB, { wait } from "./DB.js"
import Migration from "./Migration.js";

const version = 2;
const migration = new Migration();

migration.add(0, 1, async (db, transaction) => {
    db.createObjectStore("records", { autoIncrement: true }); 

    return transaction;
});
migration.add(1, 2, async (db, transaction) => {
    var request = transaction.objectStore("records").getAll();

    transaction = await wait(request);
    const blobs = request.result;

    db.deleteObjectStore("records");
    db.createObjectStore("records", { autoIncrement: true }); 

    const promises = [];
    for (const blob of blobs) {
        const data = {
            blob,
            script: null
        };
        request = transaction.objectStore("records").add(data);
        promises.push(wait(request));
    }
    const transactions = await Promise.all(promises);
    transactions.push(transaction)

    return transactions[0];
});
migration.add(0, 2, async (db, transaction) => {
    db.createObjectStore("records", { autoIncrement: true }); 

    return transaction;
});

class Record {
    static name = "BouncyDB";
    static version = version;
    static store = "records";

    constructor() {
        this.db = new DB(Record.name, Record.version);
    }

    async connect() {
        return (await this.db.connect(migration));
    }

    async get(key) {
        return (await this.db.get(Record.store, key));
    }

    async list() {
        return (await this.db.getAll(Record.store));
    }

    async save(data) {
        await this.db.add(Record.store, data);
    }

    async delete(key) {
        await this.db.delete(Record.store, key);
    }
}

export default Record;

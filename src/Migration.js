class Graph {
    constructor() {
        this.map = {}
    }

    add(before, after, value) {
        this.map[before] = this.map[before] || {};
        this.map[before][after] = value;
    }

    trace(before, after) {
        const hs = [{ ps: [before], vs: [] }];
        while (hs.length > 0) {
            const {ps, vs} = hs.shift();
            const p = ps.slice(-1)[0];

            for (const n in this.map[p]) {
                const v = this.map[p][n];

                if (n == after) {
                    return (vs.concat([v]));
                }

                if (ps.includes(n)) {
                    continue;
                }

                hs.push({
                    ps: ps.concat([n]),
                    vs: vs.concat([v])
                });
            }
        }
        
        return null;
    }
}

class Migration {
    constructor() {
        this.updates = new Graph();
    }

    add(before, after, update) {
        const value = (db, transaction) => {
            console.log(`Migrating from ${before} to ${after}.`);
            return update(db, transaction);
        }
        this.updates.add(before, after, value);
    }

    async migrate(before, after, db, transaction) {
        const trace = this.updates.trace(before, after);

        if (trace === null) {
            throw new Error(`Migration path is not found: from ${before} to ${after}.`);
        }

        for (const update of trace) {
            transaction = await update(db, transaction);
        }
        return transaction;
    }
}

export default Migration;

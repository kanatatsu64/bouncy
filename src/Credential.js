import CryptoJS from "crypto-js";

class Credential {
    constructor(key) {
        this.key = key;
    }

    static available() {
        return !(localStorage === undefined);
    }

    store(value, passwd) {
        const data = [value, passwd];
        const cipher = CryptoJS.AES.encrypt(JSON.stringify(data), passwd).toString();
        localStorage.setItem(this.key, cipher);
    }

    load(passwd) {
        const cipher = localStorage.getItem(this.key);
        const bytes  = CryptoJS.AES.decrypt(cipher, passwd);

        try {
            const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            const [value, expected] = data;
            if (passwd == expected) {
                return value;
            } else {
                return null;
            }
        } catch {
            return null;
        }
    }

    login(passwd) {
        return !!this.load(passwd);
    }

    exists() {
        return !!localStorage.getItem(this.key);
    }
}

export default Credential;

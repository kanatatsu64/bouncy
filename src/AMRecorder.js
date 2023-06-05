class AMRecorder {
    constructor (start, stop) {
        // state: init | trans | rec | shot | err
        this.state = "init";
        this.start = start;
        this.stop = stop;
    }

    toInit() {
        switch (this.state) {
            case "init":
                return true;
            case "rec":
            case "shot":
                var res = this.stop();
                if (res) {
                    this.state = "init";
                    return true;
                } else {
                    this.state = "err";
                    return false;
                }
            default:
                this.state = "err";
                return false;
        }
    }

    toTrans() {
        switch (this.state)  {
            case "init":
                var res = this.start();
                if (res) {
                    this.state = "trans";
                    return true;
                } else {
                    this.state = "err";
                    return false;
                }
            default:
                this.state = "err";
                return false;
        }
    }

    toRec() {
        switch (this.state) {
            case "trans":
                this.state = "rec";
                return true;
            default:
                this.state = "err";
                return false;
        }
    }

    toShot() {
        switch (this.state) {
            case "trans":
                this.state = "shot";
                return true;
            default:
                this.state = "err";
                return false;
        }
    }

    isRecording() {
        switch (this.state) {
            case "init":
                return false;
            case "trans":
            case "rec":
            case "shot":
                return true;
            case "err":
                return false;
        }
    }

    isErr() {
        return (this.state == "err");
    }

    reset() {
        this.state = "init";
    }
}

export default AMRecorder;

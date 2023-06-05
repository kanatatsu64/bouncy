import AMRecorder from "./src/AMRecorder.js";
import BtnControl from "./src/BtnControl.js";
import MockStream from "./src/MockStream.js";

function configure(_stream) {
    const audio = document.querySelector("audio#input");
    const mock = new MockStream(audio);

    const stream = _stream; // mock.stream;

    const recorder = new window.MediaRecorder(stream);
    let chunks = [];
    let recording = false;

    recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            chunks.push(event.data);
        }
    };

    recorder.onstop = () => { 
        const blob = new Blob(chunks, {
            type: "audio/mpeg"
        });
        chunks = [];

        const url = URL.createObjectURL(blob);
        const audio = document.querySelector("audio#output");
        audio.src = url;
    }

    function onDown() {
        switch (amr.state) {
            case "init":
                amr.toTrans();
                break;
            case "rec":
                break;
            default:
                alert("error");
                break;
        }
    }

    function onLong() {
        switch (amr.state) {
            case "trans":
                amr.toShot();
                break;
            case "rec":
                break;
            default:
                alert("error");
                break;
        }
    }

    function onUp() {
        switch (amr.state) {
            case "trans":
                amr.toRec();
                break;
            case "rec":
                amr.toInit();
                break;
            case "shot":
                amr.toInit();
                break;
            default:
                alert("error");
                break;
        }
    }

    const button = document.querySelector("button");
    const bc = new BtnControl(button, onDown, onLong, onUp);

    function start() {
        if (!recording) {
            recording = true;
            button.classList.add("on");
            recorder.start();
            return true;
        } else {
            return false;
        }
    }

    function stop() {
        if (recording) {
            recording = false;
            recorder.stop();
            button.classList.remove("on");
            return true;
        } else {
            return false;
        }
    }

    const amr = new AMRecorder(start, stop);
}

if (navigator.mediaDevices) {
    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: false
        }).then(configure);
}

import { getWaveBlob } from "webm-to-wav-converter"

import AMRecorder from "./src/AMRecorder.js";
import BtnControl from "./src/BtnControl.js";
import MockStream from "./src/MockStream.js";
import AudioPost from "./component/AudioPost.js";
import Record from "./src/Record.js";
import Speech from "./src/Speech.js";

const speech = new Speech();

function add(data) {
    const url = URL.createObjectURL(data.blob);

    const ul = document.querySelector("main ul");
    const li = document.createElement("li");
    const post = new AudioPost(url, data.script, speech);
    li.appendChild(post);
    ul.appendChild(li);
}

async function init() {
    const record = new Record();
    await record.connect();
    const data = await record.list();

    data.forEach(add);
}

async function save(blob) {
    const data = {
        blob,
        script: null
    };
    const record = new Record();
    await record.connect();
    await record.save(data);

    add(data);
}

function configure(stream) {
    const recorder = new window.MediaRecorder(stream);
    let chunks = [];
    let recording = false;

    recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            chunks.push(event.data);
        }
    };

    recorder.onstop = async () => { 
        const blob = await getWaveBlob(new Blob(chunks)); 
        chunks = [];

        save(blob);
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

    const button = document.querySelector("button#record");
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

const accountElement = document.querySelector("section#speech_account");
const signupElements = document.querySelectorAll(".speech_signup");
const loginElements = document.querySelectorAll(".speech_login");
const login = document.querySelector("#login");
const logout = document.querySelector("#logout");
const register = document.querySelector("#register");
const form = document.querySelector("form")

if (!speech.loggedin()) {
    accountElement.classList.add("open");
    if (speech.exists()) {
        loginElements.forEach(elem => elem.classList.add("open"));
    } else {
        signupElements.forEach(elem => elem.classList.add("open"));
    }
}

form.onsubmit = (event) => event.preventDefault();

login.onclick = (event) => {
    const formData = new FormData(form);
    const passwd = formData.get("speech_passwd");

    if (!speech.login(passwd)) {
        alert("Failed to login.");
        return;
    }
    loginElements.forEach(elem => elem.classList.remove("open"));
    accountElement.classList.remove("open");
};

register.onclick = (event) => {
    const formData = new FormData(form);
    const key = formData.get("speech_key");
    const region = formData.get("speech_region");
    const passwd = formData.get("speech_passwd");

    speech.signup(key, region, passwd);
    accountElement.classList.remove("open");
};

logout.onclick = (event) => {
    speech.logout();
    loginElements.forEach(elem => elem.classList.remove("open"));
    signupElements.forEach(elem => elem.classList.add("open"));
}

init();

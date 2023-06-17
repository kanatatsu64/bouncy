import { getWaveBlob } from "webm-to-wav-converter"

import AMRecorder from "./src/AMRecorder.js";
import BtnControl from "./src/BtnControl.js";
import MockStream from "./src/MockStream.js";
import AudioPost from "./component/AudioPost.js";
import Record from "./src/Record.js";
import API from "./src/API.js";

const api = new API();
const record = new Record();

function add(data) {
    const url = URL.createObjectURL(data.blob);

    const ul = document.querySelector("main ul");
    const li = document.createElement("li");
    const post = new AudioPost(url, data.script, api, data.id);
    post.onDelete = async (id) => {
        await record.delete(id);
        ul.removeChild(li);
    };
    li.appendChild(post);
    ul.appendChild(li);
}

async function init() {
    await record.connect();
    const data = await record.list();

    data.forEach(add);
}

async function save(blob) {
    const data = {
        blob,
        script: null
    };
    await record.connect();
    const id = await record.save(data);

    add({ ...data, id });
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

const accountElement = document.querySelector("section#account");
const signupElements = document.querySelectorAll(".account_signup");
const loginElements = document.querySelectorAll(".account_login");
const login = document.querySelector("#login");
const logout = document.querySelector("#logout");
const register = document.querySelector("#register");
const form = document.querySelector("form")

let conversation = null;

import("./credentials.json").then(async data => {
    const speech_key = document.querySelector("#speech_key");
    const speech_region = document.querySelector("#speech_region");
    const openai_key = document.querySelector("#openai_key");
    speech_key.value = data.azure.key;
    speech_region.value = data.azure.region;
    openai_key.value = data.openai.key;
}).catch(err => {
    console.log(err);
});

if (!api.loggedin()) {
    accountElement.classList.add("open");
    if (api.exists()) {
        loginElements.forEach(elem => elem.classList.add("open"));
    } else {
        signupElements.forEach(elem => elem.classList.add("open"));
    }
}

form.onsubmit = (event) => event.preventDefault();

login.onclick = (event) => {
    const formData = new FormData(form);
    const passwd = formData.get("passwd");

    if (!api.login(passwd)) {
        alert("Failed to login.");
        return;
    }
    loginElements.forEach(elem => elem.classList.remove("open"));
    accountElement.classList.remove("open");
    conversation = api.conversation();
};

register.onclick = (event) => {
    const formData = new FormData(form);
    const speech_key = formData.get("speech_key");
    const speech_region = formData.get("speech_region");
    const openai_key = formData.get("openai_key");
    const passwd = formData.get("passwd");

    api.signup(speech_key, speech_region, openai_key, passwd);
    accountElement.classList.remove("open");
    conversation = api.conversation();
};

logout.onclick = (event) => {
    api.logout();
    loginElements.forEach(elem => elem.classList.remove("open"));
    signupElements.forEach(elem => elem.classList.add("open"));
    conversation = null;
}

function newLn() {
    writeLn("");
}

function writeLn(msg) {
    const ul = document.querySelector("main ul");
    const li = document.createElement("li");
    li.textContent = msg;
    ul.appendChild(li);
}

function write(msg) {
    const ul = document.querySelector("main ul");
    const lis = ul.querySelectorAll("li");
    if (lis.length == 0) {
        writeLn(msg);
        return;
    }
    const li = lis[lis.length-1];
    li.textContent += msg;
}

const say = document.querySelector("#say");
const textarea = document.querySelector("textarea");
say.onclick = async () => {
    if (conversation) {
        const req = textarea.value;
        writeLn(req);
        newLn();
        for await (const chunk of conversation.say(req)) {
            write(chunk);
        }
    }
}

init();

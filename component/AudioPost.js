const res = await import("./AudioPost.htm");
const text = await res.default;
const dom = new DOMParser().parseFromString(text, "text/html");
const html = dom.querySelector("body").innerHTML;
const template = document.createElement("template");
template.innerHTML = html;
const content = template.content;

class AudioPost extends HTMLElement {
    constructor(src, script, api, id) {
        super();
        this.id = id;
        this.root = this.attachShadow({ mode: "open" });
        this.root.appendChild(content.cloneNode(true));
        this.audio = this.root.querySelector("audio");
        this.button = this.root.querySelector("button#script");
        this.p = this.root.querySelector("p");

        async function loadScript(blob) {
            const file = new File([blob], 'temp.wav');
            return await api.recognize(file);
        }

        if (src) {
            this.src = src;
        }
        if (script) {
            this.script = script;
        }

        if (this.getAttribute("src")) {
            this.src = this.getAttribute("src");
        }
        if (this.getAttribute("script")) {
            this.script = this.getAttribute("script");
        }

        this.button.dataset.open = "false";
        this.button.dataset.lock = "false";
        this.button.onclick = async () => {
            if (this.button.dataset.lock == "true") {
                return;
            }

            if (this.button.dataset.open == "true") {
                this.p.classList.remove("open");
                this.button.dataset.open = "false";
            } else {
                this.button.dataset.lock = "true";
                if (!this.p.textContent) {
                    const res = await fetch(this.src);
                    const blob = await res.blob();
                    this.p.textContent = await loadScript(blob);
                }
                this.button.dataset.lock = "false";

                this.p.classList.add("open");
                this.button.dataset.open = "true";
            }
        }
    }

    set src(value) {
        this.audio.src = value;
    }

    get src() {
        return this.audio.src;
    }

    set script(value) {
        this.p.textContent = value;
    }

    get script() {
        return this.p.textContent;
    }

    set onDelete(handler) {
        this.root.querySelector("button#delete").onclick = () => {
            handler(Number(this.id));
        };
    }
}

customElements.define("audio-post", AudioPost);

export default AudioPost;

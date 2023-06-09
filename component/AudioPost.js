const res = await fetch("component/AudioPost.htm");
const text = await res.text();
const dom = new DOMParser().parseFromString(text, "text/html");
const html = dom.querySelector("body").innerHTML;
const template = document.createElement("template");
template.innerHTML = html;
const content = template.content;

class AudioPost extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: "open" });
        this.root.appendChild(content.cloneNode(true));
        this.audio = this.root.querySelector("audio");

        if (this.getAttribute("src")) {
            this.audio.src = this.getAttribute("src");
        }
    }

    set src(value) {
        this.audio.src = value;
    }

    get src() {
        return this.audio.src;
    }
}

customElements.define("audio-post", AudioPost);

export default AudioPost;

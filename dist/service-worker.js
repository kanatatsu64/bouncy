if(!self.define){let e,i={};const s=(s,r)=>(s=new URL(s+".js",r).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(r,n)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(i[t])return;let o={};const c=e=>s(e,t),f={module:{uri:t},exports:o,require:c};i[t]=Promise.all(r.map((e=>f[e]||c(e)))).then((e=>(n(...e),o)))}}define(["./workbox-2b403519"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"537.js",revision:"2a9d9e8791e96b9cad06e6170d2090fb"},{url:"index.html",revision:"31a6571436308c1895d5271c4397a84c"},{url:"main.css",revision:"9118b2b55b48e4f16c8f24ab725062ec"},{url:"main.js",revision:"faaf41baef8d04330cb12ffa30fec0e5"},{url:"main.js.LICENSE.txt",revision:"e4c1d7ad2eae11bf7a39e4e4b5882a60"}],{})}));

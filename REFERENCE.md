# 参考文献

## 音声入出力

### HTML audio

- audio tag
  https://developer.mozilla.org/ja/docs/Web/HTML/Element/audio

- HTMLAudioElement
  https://developer.mozilla.org/ja/docs/Web/API/HTMLAudioElement
  
- HTMLMediaElement
  https://developer.mozilla.org/ja/docs/Web/API/HTMLMediaElement
 
  - play()
  - pause()

### マイクの使用

https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getUserMedia

```js
stream = await navigator.mediaDevices.getUserMedia(constraints);
```

- 安全なコンテキスト以外では、`navigator.mediaDevices`が`undefined`となり、TypeErrorが発生する。

#### 安全なコンテキスト

https://developer.mozilla.org/ja/docs/Web/Security/Secure_Contexts

- 基本は`https://`である必要がある。
- ローカル配信の場合は、`http://localhost`などでもOK。

### 音声認識・音声合成

https://developer.mozilla.org/ja/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API

### 録音

https://developer.mozilla.org/ja/docs/Web/API/MediaStream_Recording_API

### オーディオAPI

https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API

#### Basic Concept

https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API

## GitHub

https://github.com/kanatatsu64/bouncy

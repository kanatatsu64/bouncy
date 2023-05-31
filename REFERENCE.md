# 参考文献

## 音声入出力

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

### オーディオAPI

https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API

## GitHub

https://github.com/kanatatsu64/bouncy

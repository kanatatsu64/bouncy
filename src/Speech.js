const SDK = require("microsoft-cognitiveservices-speech-sdk");
import { SpeechConfig, SpeechRecognizer, AudioConfig } from "microsoft-cognitiveservices-speech-sdk";
import Credential from "./Credential";

const Speech = (function() {
    let secret = undefined;
    let speechConfig = undefined;

    return class {
        constructor() {
            this.credential_key = new Credential("key");
            this.credential_region = new Credential("region");
        }

        init() {
            const key = this.credential_key.load(secret);
            const region = this.credential_region.load(secret);
            speechConfig = SpeechConfig.fromSubscription(key, region);
            speechConfig.speechRecognitionLanguage = "ja-JP";
        }

        ready() {
            return !!speechConfig;
        }

        signup(key, region, passwd) {
            this.credential_key.store(key, passwd);
            this.credential_region.store(region, passwd);
            secret = passwd;
            this.init();
        }

        logout() {
            secret = undefined;
            speechConfig = undefined;
        }

        login(passwd) {
            if (!this.credential_key.login(passwd)) {
                return false;
            }
            if (!this.credential_region.login(passwd)) {
                return false;
            }
            secret = passwd;
            this.init();
            return true;
        }

        loggedin() {
            if (!secret) {
                return false;
            }

            return this.login(secret);
        }

        exists() {
            if (!this.credential_key.exists()) {
                return false;
            }
            if (!this.credential_region.exists()) {
                return false;
            }
            return true;
        }

        async recognize(file) {
            if (!this.ready()) {
                return null;
            }

            let audioConfig = AudioConfig.fromWavFileInput(file);
            let speechRecognizer = new SpeechRecognizer(speechConfig, audioConfig);

            return new Promise((resolve, reject) => {
                speechRecognizer.recognizeOnceAsync(result => {
                    switch (result.reason) {
                        case SDK.ResultReason.RecognizedSpeech:
                            resolve(result.text);
                            break;
                        case SDK.ResultReason.NoMatch:
                            console.log("NOMATCH: Speech could not be recognized.");
                            reject(result);
                            break
                        case SDK.ResultReason.Canceled:
                            const cancellation = SDK.CancellationDetails.fromResult(result);
                            console.log(`CANCELED: Reason=${cancellation.reason}`);

                            if (cancellation.reason == SDK.CancellationReason.Error) {
                                console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                                console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                                console.log("CANCELED: Did you set the speech resource key and region values?");
                            }
                            reject(result);
                            break;
                    }
                    speechRecognizer.close();
                });
            });
        }

        debug() {
            if (!this.loggedin()) {
                return null;
            }

            const key = this.credential_key.load(secret);
            const region = this.credential_region.load(secret);

            //
            // Commented out for security reason.
            //
            // console.log([key, region]);
        }
    };
})();

export default Speech;

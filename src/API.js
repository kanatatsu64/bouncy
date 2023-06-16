const SDK = require("microsoft-cognitiveservices-speech-sdk");
import { SpeechConfig, SpeechRecognizer, AudioConfig } from "microsoft-cognitiveservices-speech-sdk";
import { Configuration, OpenAIApi } from "openai";
import Credential from "./Credential";
import Conversation from "./Conversation";

const API = (function() {
    let secret = undefined;
    let speechConfig = undefined;
    let openaiClient = undefined;

    return class {
        constructor() {
            this.speech_key = new Credential("speech_key");
            this.speech_region = new Credential("speech_region");
            this.openai_key = new Credential("openai_key");
        }

        init() {
            const speech_key = this.speech_key.load(secret);
            const speech_region = this.speech_region.load(secret);
            speechConfig = SpeechConfig.fromSubscription(speech_key, speech_region);
            speechConfig.speechRecognitionLanguage = "ja-JP";

            const openai_key = this.openai_key.load(secret);
            const openaiConfig = new Configuration({
                apiKey: openai_key
            });
            openaiClient = new OpenAIApi(openaiConfig);
        }

        ready() {
            return (!!speechConfig) && (!!openaiClient);
        }

        signup(speech_key, speech_region, openai_key, passwd) {
            this.speech_key.store(speech_key, passwd);
            this.speech_region.store(speech_region, passwd);
            this.openai_key.store(openai_key, passwd);
            secret = passwd;
            this.init();
        }

        logout() {
            secret = undefined;
            speechConfig = undefined;
            openaiClient = undefined;
        }

        login(passwd) {
            if (!this.speech_key.login(passwd)) {
                return false;
            }
            if (!this.speech_region.login(passwd)) {
                return false;
            }
            if (!this.openai_key.login(passwd)) {
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
            if (!this.speech_key.exists()) {
                return false;
            }
            if (!this.speech_region.exists()) {
                return false;
            }
            if (!this.openai_key.exists()) {
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

        conversation(context=[], model="gpt-3.5-turbo") {
            if (!this.ready()) {
                return null;
            }

            return new Conversation(openaiClient, context, model);
        }

        debug() {
            if (!this.loggedin()) {
                return null;
            }

            const speech_key = this.speech_key.load(secret);
            const speech_region = this.speech_region.load(secret);
            const openai_key = this.openai_key.load(secret);

            //
            // Commented out for security reason.
            //
            // console.log([speech_key, speech_region, openai_key]);
        }
    };
})();

export default API;

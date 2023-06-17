import { OpenAIApi } from "../node_modules/openai/dist/api";
import { Tiktoken, encoding_for_model } from "../node_modules/tiktoken/tiktoken";
import SSE, { SSEEvent } from "./SSE";
import { Option } from "./Types";

type Role = 'system' | 'user' | 'assistant'
type Message = {
    role: Role,
    content: string
};
type Passage = Message & {
    token_len: number
};

type ModelType = 'gpt-3.5-turbo';

const Conversation = (function () {
    let client: Option<OpenAIApi & { key: string }> = undefined;

    return (class {
        history: Passage[];
        model: ModelType;
        encoding: Tiktoken;

        constructor(openai: OpenAIApi & { key: string },
                    context: string[]=[],
                    model: ModelType="gpt-3.5-turbo") {
            client = openai;
            this.model = model;

            this.encoding = encoding_for_model(model);
            this.history = context.map(content => (
                {
                    role: 'system',
                    content,
                    token_len: this.getTokenLen(content)
                }
            ));
        }

        ready() {
            return (!!client);
        }

        getTokenLen(str: string): number {
            return this.encoding.encode(str).length;
        }

        addHistory(msg: Message) {
            this.history.push({
                ...msg,
                token_len: this.getTokenLen(msg.content)
            });
        }

        getHistoryMessages(): Message[] {
            return this.history.map(({ role, content }) => ({ role, content }));
        }

        async *say(msg: string): AsyncGenerator<string> {
            const message: Message = { role: 'user', content: msg };

            this.addHistory(message);

            const url = "https://api.openai.com/v1/chat/completions";
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${client?.key}`
            };
            const payload = {
                model: this.model,
                messages: [
                    ...this.getHistoryMessages(),
                    message
                ],
                stream: true
            };
            const sse = new SSE(url, { headers, payload });
            let resolve: (value?: any) => void = () => {};
            let reject: (reason?: any) => void = () => {};
            let promise: Option<Promise<string>> = new Promise((ok, err) => {
                resolve = ok;
                reject = err;
            });
            let role: Option<Role> = undefined;
            let content: string = "";
            sse.addEventListener('message', (event: Event) => {
                if (!promise) {
                    return;
                }
                try {
                    const value = (event as SSEEvent).data;
                    if (value == "[DONE]") {
                        const reply: Message = {
                            role: role || 'assistant',
                            content
                        };
                        this.addHistory(reply);
                        role = undefined;
                        content = "";

                        resolve();
                        promise = undefined;
                        resolve = () => {};
                        reject = () => {};
                        return;
                    }
                    const json = JSON.parse(value);
                    const delta = json.choices[0].delta;
                    if ("role" in delta) {
                        if (role) {
                            const reply: Message = {
                                role,
                                content
                            };
                            this.addHistory(reply);
                            role = undefined;
                            content = "";
                        }
                        role = delta.role;
                    } else if ("content" in delta) {
                        content += delta.content;
                        resolve(delta.content);
                        promise = new Promise((ok, err) => {
                            resolve = ok;
                            reject = err;
                        });
                    }
                } catch (err) {
                    reject(err);
                    promise = undefined;
                    resolve = () => {};
                    reject = () => {};
                    return;
                }
            });
            sse.addEventListener('done', () => {
                resolve();
                promise = undefined;
                resolve = () => {};
                reject = () => {};
            });
            sse.stream();

            while (promise) {
                const data = await promise;
                if (data) {
                    yield data;
                }
            }
        }
    })
})();

export default Conversation;

import { OpenAIApi } from "../node_modules/openai/dist/api";
import { Tiktoken, encoding_for_model } from "../node_modules/tiktoken/tiktoken";

type Message = {
    role: 'system' | 'user' | 'assistant',
    content: string
};
type Passage = Message & {
    token_len: number
};

type ModelType = 'gpt-3.5-turbo';

class Conversation {
    api: OpenAIApi;
    history: Passage[];
    model: ModelType;
    encoding: Tiktoken;

    constructor(openai: OpenAIApi,
                context: string[]=[],
                model: ModelType="gpt-3.5-turbo") {
        this.api = openai;
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

    async say(msg: string): Promise<string> {
        const message: Message = { role: 'user', content: msg };

        const res = await this.api.createChatCompletion({
            model: this.model,
            messages: [
                ...this.getHistoryMessages(),
                message
            ]
        });
        this.addHistory(message);

        const reply: Message = res.data.choices[0].message;
        this.addHistory(reply);

        return reply.content;
    }
}

export default Conversation;

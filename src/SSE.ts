import { Option } from "./Types";

type HeadersType = {
    [name: string]: string
};
type MethodType = 'GET' | 'POST';
type OptionsType = {
    headers?: HeadersType,
    payload?: any,
    method?: MethodType
};
type FetchOptionsType = {
    headers: HeadersType,
    method: MethodType,
    body?: string
};
type SSEResponse = {
    type: 'event' | 'data' | 'id' | 'comment',
    value: string
} | {
    type: 'retry',
    value: number
} | {
    type: 'delimiter'
};
type SSEState = {
    chunks: string[],
    event: string,
    id?: string
}

export class SSEEvent extends Event {
    data: string;
    id?: string;

    constructor(state: SSEState) {
        super(state.event);
        this.data = state.chunks.join("\n");
        this.id = state.id;
    }
}

function parseLine(line: string): Option<SSEResponse> {
    if (line.startsWith("event:")) {
        return {
            type: 'event',
            value: line.slice(6).trim()
        }
    } else if (line.startsWith("data:")) {
        return {
            type: 'data',
            value: line.slice(5).trim()
        }
    } else if (line.startsWith("id:")) {
        return {
            type: 'id',
            value: line.slice(3).trim()
        }
    } else if (line.startsWith("retry:")) {
        const value = line.slice(6).trim();
        const num = parseInt(value);
        if (Number.isNaN(num)) {
            return;
        }
        if (String(num) != value) {
            return;
        }
        return {
            type: 'retry',
            value: num
        }
    } else if (line.startsWith(":")) {
        return {
            type: 'comment',
            value: line.slice(1).trim()
        }
    } else if (line == "") {
        return {
            type: 'delimiter'
        }
    } else {
        return;
    }
}

class SSE extends EventTarget {
    url: string;
    headers: HeadersType;
    payload: any;
    method: MethodType;
    state: SSEState;
    done: boolean = false;

    constructor(url: string, options?: OptionsType) {
        super();
        this.url = url;
        this.headers = options?.headers || {};
        this.payload = options?.payload;
        this.method = options?.method || (this.payload ? 'POST' : 'GET');

        this.state = {
            chunks: [],
            event: 'message',
            id: undefined
        };
    }

    initState() {
        this.state = {
            chunks: [],
            event: 'message',
            id: undefined
        };
    }

    setState(res: SSEResponse) {
        if (res.type == 'data') {
            this.state.chunks.push(res.value);
        } else if (res.type == 'event') {
            this.state.event = res.value;
        } else if (res.type == 'id') {
            this.state.id = res.value;
        }
    }

    add(res: SSEResponse) {
        this.setState(res);
        if (res.type == 'delimiter') {
            this.dispatchEvent(new SSEEvent(this.state));
            this.initState();
        }
    }

    end(res: SSEResponse) {
        this.setState(res);
        this.dispatchEvent(new SSEEvent(this.state));
        this.dispatchEvent(new SSEEvent({ event: 'done', chunks: [] }));
        this.initState();
        this.done = true;
    }

    async stream() {
        const options: FetchOptionsType = {
            headers: this.headers,
            method: this.method,
        }

        if (this.payload) {
            options.body = JSON.stringify(this.payload);
        }

        const res = await fetch(this.url, options);
        const reader = res.body?.getReader();

        if (res.status !== 200 || !reader) {
            return "error";
        }

        const decoder = new TextDecoder('utf-8');
        try {
            let remains: string = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    const res = parseLine(remains);
                    if (res) {
                        this.end(res);
                    }
                    break;
                }

                // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n").map(line => line.trim());

                if (lines.length > 0) {
                    lines[0] = remains + lines[0];
                    remains = lines[lines.length-1];
                }

                lines.slice(0, -1).map(parseLine).forEach((res) => {
                    if (res) {
                        this.add(res);
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }

        reader.releaseLock();
    }
}

export default SSE;

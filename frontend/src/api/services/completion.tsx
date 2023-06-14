import { webSocketBaseUrl } from "./util";
import { CompletionInferenceRequest } from "../models/CompletionInferenceRequest";

export class CompletionClient {
    private ws?: WebSocket;

    constructor(private baseUrl: string) {}

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.baseUrl);
            this.ws.onopen = () => {
                resolve();
            };

            this.ws.onerror = () => {
                reject(`Failed to connect to ${this.baseUrl}`);
            };
        });
    }

    disconnect(): void {
        console.log("disconnecting");
        if (this.ws) {
            console.log("disconnect == noop");
            this.ws?.close();
            this.ws = undefined;
        }
    }

    completeAsync(msg: CompletionInferenceRequest, onToken: (token: string) => void, onCompleted: () => void) {
        if (!this.ws) {
            throw Error("WebSocket used before initialized");
        }
        this.ws.onmessage = ({data}) => {
            onToken(data);
        }
        this.ws.onclose = () => {
            onCompleted();
        }
        this.ws.send(JSON.stringify(msg));
    }
}

export function createDefaultClient(model: string, version: string) {
    const baseConnectStr = webSocketBaseUrl();
    const url = `${baseConnectStr}/v1/${model}/${version}/complete`;
    return new CompletionClient(url);
}

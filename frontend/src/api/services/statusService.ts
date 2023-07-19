import { isDevServer } from "./util";

/**
 * Status service allows for a simple status checking mechanism.
 */
const pollStatus = async () => {
    const abort = new AbortController();
    const healthz = isDevServer() ? "//127.0.0.1:8000/healthz" : "/healthz";

    window.setTimeout(() => abort.abort("timed out"), 2_000);

    const result = await fetch(healthz, { signal: abort.signal })
        .then((resp) => resp.status)
        .catch(() => 500);
    return result === 200;
};

export type Status = "loading" | "online" | "offline";

export class StatusChecker {
    private timerId = -1;

    public status: Status = "loading";

    constructor(private onPoll: (value: Status) => void) {}

    start() {
        this.loop();
    }

    private loop() {
        console.log("next poll");
        pollStatus()
            .then((isConnected) => {
                this.onPoll(isConnected ? "online" : "offline");
                this.status = isConnected ? "online" : "offline";
            })
            .catch(() => {
                this.onPoll("offline");
                this.status = "offline";
            })
            .finally(() => {
                console.log("scheduling next poll");
                this.timerId = window.setTimeout(() => this.loop(), 3_000);
            });
    }

    stop() {
        if (this.timerId >= 0) {
            window.clearTimeout(this.timerId);
        }
    }
}

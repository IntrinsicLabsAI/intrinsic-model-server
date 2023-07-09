/**
 * @returns True if we are running in the Vite dev server, false otherwise.
 */
export function isDevServer() {
    return window.location.host.endsWith(":5173");
}

function webSocketScheme() {
    switch (window.location.protocol) {
        case "https:":
            return "wss";
        default:
            return "ws";
    }
}

export function webSocketBaseUrl() {
    const scheme = webSocketScheme();
    const hostname = isDevServer() ? "0.0.0.0:8000" : window.location.host;
    return `${scheme}://${hostname}`;
}

function isDevServer() {
    return window.location.host.endsWith(":5173");
}

export function baseURL() {
    const hostname = isDevServer() ? "0.0.0.0:8000" : window.location.host;
    console.log(`${window.location.protocol}//${hostname}`);
    return `${window.location.protocol}//${hostname}`;
}

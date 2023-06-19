import { useEffect, useMemo } from "react";
import { useState } from "react";
import { createDefaultClient } from "../api/services/completion";
import React from "react";

const CompletionLivePreview = React.memo(({
    prompt,
    model,
    version,
    temperature,
    tokenLimit,
}: {
    prompt: string,
    model: string,
    version: string,
    temperature: number,
    tokenLimit: number,
}) => {
    const [tokens, setTokens] = useState("");
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        const client = createDefaultClient(model, version);

        async function startWebSocket() {
            await client.connect();
            client.completeAsync(
                {
                    prompt,
                    temperature,
                    tokens: tokenLimit,
                },
                (token) => setTokens(prev => prev + token),
                () => {
                    setCompleted(true);
                },
            )
        }

        // Kick off async task.
        startWebSocket();

        return () => {
            client.disconnect();
        }
    }, [model, version, prompt, temperature, tokenLimit]);

    const bgStyle = useMemo(() => completed ? " outline outline-primary-600 " : " outline outline-gray-600 ", [completed]);

    return (
        <div className={` rounded overflow-x-auto p-4 mb-4 ${bgStyle}`}>
            <p className="leading-snug font-mono whitespace-pre-line text-gray-400">
                {tokens}
            </p>
        </div>
    );
});

export default CompletionLivePreview;
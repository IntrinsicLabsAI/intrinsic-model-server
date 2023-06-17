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

    const bgStyle = useMemo(() => completed ? "bg-green-700" : "", [completed]);

    return (
        <div className={`text-xl text-white font-mono whitespace-pre-wrap rounded-xl overflow-x-auto m-4 p-4 ${bgStyle}`}>
            {tokens}
        </div>
    );
});

export default CompletionLivePreview;
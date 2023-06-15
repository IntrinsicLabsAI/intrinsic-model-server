import { useEffect } from "react";
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
                    // What to do? Set the completion state to finalized or something.
                    console.log("completed");
                },
            )
        }

        // Kick off async task.
        startWebSocket();

        return () => {
            client.disconnect();
        }
    }, [model, version, prompt, temperature, tokenLimit]);

    return (
        <div className="text-xl text-white font-mono whitespace-pre-wrap">
            {tokens}
        </div>
    );
});

export default CompletionLivePreview;
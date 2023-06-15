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

    // Try and start the prompt shit off the very first time.
    useEffect(() => {
        const client = createDefaultClient(model, version);

        // Get all of the shit
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
        <div className="text-xl text-orange-600 font-mono whitespace-pre-wrap">
            {tokens}
        </div>
    );
});

export default CompletionLivePreview;
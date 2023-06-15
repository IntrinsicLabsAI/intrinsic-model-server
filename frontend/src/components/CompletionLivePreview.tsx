import { useEffect } from "react";
import { useState } from "react";
import { createDefaultClient } from "../api/services/completion";
import React from "react";

const CompletionLivePreview = React.memo(({
    prompt,
    model,
    version,
}: {
    prompt: string,
    model: string,
    version: string,
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
                    prompt: prompt,
                    temperature: 0.3,
                    tokens: 128,
                },
                (token) => {
                    console.log(`next token: ${token} (${token.length})`);
                    setTokens(prev => prev + token);
                },
                () => {
                    console.log("completed");
                },
            )
        }

        // Kick off async task.
        startWebSocket();

        return () => {
            client.disconnect();
        }
    }, [model, version, prompt]);

    return (
        <div className="text-xl text-orange-600 font-mono whitespace-pre-wrap">
            {tokens}
        </div>
    );
});

export default CompletionLivePreview;
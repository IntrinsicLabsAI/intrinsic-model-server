import { useMemo, useState } from "react"
import Dropdown from "./core/Dropdown"
import Widget from "./core/Widget"
import CompletionLivePreview from "./CompletionLivePreview";
import { Icon } from "@blueprintjs/core";
import React from "react";
import { useGetModelsQuery } from "../api/services/baseService";

const InferenceRunner = React.memo(({
    model,
}: {
    model: string,
}) => {
    const [prompt, setPrompt] = useState("");
    const [version, setVersion] = useState("0.1.0");
    const [isRunning, setIsRunning] = useState(false);

    // Find all models that only match this current model version.
    const { data: allModels } = useGetModelsQuery();

    const allVersions = useMemo(() => {
        return allModels === undefined
            ? [{ id: "0.1.0", value: "0.1.0" }]
            : allModels.models
                .filter(m => m.name === model)
                .map(m => ({ id: m.version, value: m.version }));
    }, [allModels, model]);

    return (
        <Widget title="Inference Runner">
            <div>
                {!isRunning
                    ? (<>
                        <div className="flex flex-col w-full gap-4">
                            <div className="flex flex-row w-full gap-4 justify-start">
                                <h3 className=" text-gray-200">
                                    Run, iterate, and refine your prompts before using in production.
                                    All prompts are run against this WebServer.
                                    If responses are slow, try adding more resources to your server.</h3>
                            </div>

                            <div className="flex flex-row w-full gap-4 justify-start">
                                <h3 className=" font-semibold leading-none">Prompt</h3>
                                <textarea
                                    className="ml-auto w-[80%] bg-dark-200 focus:border-primary-100 focus:ring-0 focus:shadow-none rounded-sm h-40 text-gray-400"
                                    value={prompt}
                                    placeholder="Enter prompt..."
                                    onChange={(evt) => setPrompt(evt.target.value)} />
                            </div>

                            <div className="flex flex-row w-full gap-4 justify-start">
                                <h3 className=" flex-grow font-semibold leading-none">Version</h3>
                                <div className=" items-baseline w-[80%]">
                                    <Dropdown
                                        buttonText="Model Version"
                                        items={allVersions}
                                        onSelectionChange={(version: string) => setVersion(version)}
                                    />

                                </div>
                            </div>

                            <div className="flex flex-row w-full gap-4 justify-start">
                                <h3 className=" font-semibold leading-none">Tempurature</h3>
                                <input className="ml-auto w-[80%] focus:border-primary-100 focus:ring-0 focus:shadow-none rounded bg-dark-200 text-gray-400" type="number" id="temp" />
                            </div>

                            <div className="flex flex-row w-full gap-4 justify-start">
                                <h3 className=" font-semibold leading-none">Token Limit</h3>
                                <input className="ml-auto w-[80%] focus:border-primary-100 focus:ring-0 focus:shadow-none rounded bg-dark-200 text-gray-400" type="number" id="token" />
                            </div>

                            <div className="flex flex-row w-full gap-4 justify-start">
                                <button className="px-3 py-1.5 bg-primary-100 rounded hover:bg-primary-500 ml-auto" onClick={() => {
                                    setIsRunning(true);
                                }}>
                                    <p className=" text-dark-300 font-semibold ">Run Inference</p>
                                </button>
                            </div>
                        </div>
                    </>
                    )
                    : (<>
                        <div className="flex flex-col gap-2 w-full p-4 rounded bg-dark-200">
                            <div className=" flex flex-row ">
                                <h3 className=" font-semibold">Running Completion Query</h3>
                                <div className="ml-auto cursor-pointer p-1 hover:bg-primary-100/20 hover:rounded" onClick={() => setIsRunning(false)}><Icon icon="cross" color="#F6F7F9" /></div>
                            </div>
                            <h3 className=" font-mono text-sm whitespace-pre-wrap">
                                {prompt}
                            </h3>
                            <div className=" flex flex-row gap-3">
                                <p className=" text-xs font-bold px-1.5 py-1 bg-primary-100 rounded text-dark-400"> Version: 0.1.0 </p>
                                <p className=" text-xs font-bold px-1.5 py-1 bg-primary-100 rounded text-dark-400"> Temperature: 0.12 </p>
                                <p className=" text-xs font-bold px-1.5 py-1 bg-primary-100 rounded text-dark-400"> Tokens: 128 </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <CompletionLivePreview model={model} version={version} prompt={prompt} />
                        </div>
                    </>
                    )
                }
            </div>
        </Widget>
    )
});

export default InferenceRunner;
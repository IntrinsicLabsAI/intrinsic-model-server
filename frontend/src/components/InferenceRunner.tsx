import { useMemo, useState } from "react"
import Dropdown from "./core/Dropdown"
import Widget from "./core/Widget"
import CompletionLivePreview from "./CompletionLivePreview";
import { Icon } from "@blueprintjs/core";
import React from "react";
import { useGetModelsQuery } from "../api/services/v1";
import { isValidSemVer, semverCompare } from "../utils/semver";


interface Experiment {
    id: number;
    model: string;
    version: string;
    temperature: number;
    tokenLimit: number;
    prompt: string;
    cancel?: () => void;
}

const ConfigView = React.memo(({
    model,
    versions,
    onExperiment,
}: {
    model: string,
    versions: string[],
    onExperiment: (experiment: Experiment) => void,
}) => {
    const maxVersion = useMemo(() => {
        if (versions.length === 0) {
            return undefined;
        }

        return versions
            .sort(semverCompare)
            .reverse()[0];
    }, [versions]);
    const [temperature, setTemperature] = useState(0.2);
    const [tokenLimit, setTokenLimit] = useState(100);


    const [prompt, setPrompt] = useState<string | undefined>();
    const [version, setVersion] = useState<string | undefined>(maxVersion);
    const effectiveVersion = useMemo(() => version || maxVersion, [version, maxVersion]);

    const isValidExperimentConfig = useMemo(() => {
        return effectiveVersion != null && isValidSemVer(effectiveVersion) && prompt;
    }, [prompt, effectiveVersion]);

    const dropdownItems = useMemo(() => versions.map(v => ({ id: v, value: v })), [versions]);

    return (<>
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
                        items={dropdownItems}
                        default={maxVersion}
                        onSelectionChange={(select: string) => setVersion(select)}
                    />

                </div>
            </div>

            <div className="flex flex-row w-full gap-4 justify-start">
                <h3 className=" font-semibold leading-none">Temperature</h3>
                <input
                    className="ml-auto w-[80%] focus:border-primary-100 focus:ring-0 focus:shadow-none rounded bg-dark-200 text-gray-400"
                    type="number"
                    step={0.1}
                    min={0.0}
                    value={temperature}
                    onChange={(evt) => setTemperature(evt.target.valueAsNumber)} />
            </div>

            <div className="flex flex-row w-full gap-4 justify-start">
                <h3 className=" font-semibold leading-none">Token Limit</h3>
                <input
                    className="ml-auto w-[80%] focus:border-primary-100 focus:ring-0 focus:shadow-none rounded bg-dark-200 text-gray-400"
                    type="number"
                    value={tokenLimit}
                    onChange={(evt) => setTokenLimit(evt.target.valueAsNumber)} />
            </div>

            <div className="flex flex-row w-full gap-4 justify-start">
                <button className="px-3 py-1.5 bg-primary-100 rounded hover:bg-primary-500 ml-auto disabled:opacity-25 disabled:bg-gray-400" onClick={() => {
                    onExperiment({
                        id: Math.random(), // TODO(aduffy): Do better.
                        model: model,
                        version: version!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
                        temperature: temperature,
                        tokenLimit: tokenLimit,
                        prompt: prompt!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
                    });
                }} disabled={!isValidExperimentConfig}>
                    <p className=" text-dark-300 font-semibold ">Run Inference</p>
                </button>
            </div>
        </div>
    </>
    );
});

const RunningView = React.memo(({
    model,
    version,
    temperature,
    tokenLimit,
    prompt,
    cancel,
}: Experiment) => {
    return (
        <>
            <div className="flex flex-col gap-2 w-full p-4 rounded bg-dark-200">
                <div className=" flex flex-row ">
                    <h3 className=" font-semibold">Running Completion Query</h3>
                    <div className="ml-auto cursor-pointer p-1 hover:bg-primary-100/20 hover:rounded" onClick={() => cancel && cancel()}><Icon icon="cross" color="#F6F7F9" /></div>
                </div>
                <h3 className=" font-mono text-sm whitespace-pre-wrap">
                    {prompt}
                </h3>
                <div className=" flex flex-row gap-3">
                    <p className=" text-xs font-bold px-1.5 py-1 bg-primary-100 rounded text-dark-400"> Version: {version} </p>
                    <p className=" text-xs font-bold px-1.5 py-1 bg-primary-100 rounded text-dark-400"> Temperature: {temperature} </p>
                    <p className=" text-xs font-bold px-1.5 py-1 bg-primary-100 rounded text-dark-400"> Tokens: {tokenLimit} </p>
                </div>
            </div>
            <div className="mt-4">
                <CompletionLivePreview
                    model={model}
                    version={version}
                    prompt={prompt}
                    temperature={temperature}
                    tokenLimit={tokenLimit}
                />
            </div>
        </>
    )
});

const InferenceRunner = React.memo(({
    model,
}: {
    model: string,
}) => {
    const { data: allModels } = useGetModelsQuery();

    const versions = useMemo(
        () =>
            allModels
                ? allModels.models.filter(m => m.name === model).flatMap(m => m.versions).map(v => v.version)
                : [], [allModels, model]
    );
    const [experiments, setExperiments] = useState<Experiment[]>([]);

    return (
        <Widget title="Inference Runner">
            <div>
                <ConfigView model={model} versions={versions} onExperiment={(experiment) => {
                    setExperiments((oldExperiments) => [experiment, ...oldExperiments]);
                }} />

                <div className="pt-4">
                    {
                        experiments.map(experiment => (
                            <RunningView
                                key={experiment.id}
                                {...experiment}
                            />
                        ))
                    }
                </div>
            </div>
        </Widget>
    )
});

export default InferenceRunner;
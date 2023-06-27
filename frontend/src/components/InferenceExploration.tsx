import { useMemo, useState } from "react"
import React from "react";

import { isValidSemVer, semverCompare } from "../utils/semver";
import { useGetModelsQuery } from "../api/services/v1";

import { Icon } from "@blueprintjs/core";

import Card from "./core/Card";
import Dropdown from "./core/Dropdown";
import Column from "./layout/Column";
import TwoColumnLayout from "./layout/TwoColumnLayout";
import Callout from "./core/Callout";
import Pill from "./core/Pill";
import OneColumnLayout from "./layout/OneColumnLayout";
import { useDispatch, useSelector } from "../state/hooks";
import { ExperimentState, startActiveExperiment } from "../state/appSlice";

interface Experiment {
    id: number;
    model: string;
    version: string;
    temperature: number;
    tokenLimit: number;
    prompt: string;
}

const ExperimentInput = React.memo(({
    model,
    versions,
    runExperiment,
}: {
    model: string,
    versions: string[],
    runExperiment: (experiment: Experiment) => void,
}) => {
    const [version, setVersion] = useState<string | undefined>();
    const [prompt, setPrompt] = useState<string | undefined>();

    const setVersionFromMemo = (ver: string) => {
        if (!version) {
            setVersion(ver);
        }
    }

    const maxVersion = useMemo(() => {
        if (versions.length === 0) return undefined;

        const maxV = versions
            .sort(semverCompare)
            .reverse()[0];

        setVersionFromMemo(maxV);

        return maxV;
    }, [versions]);

    const [temperature, setTemperature] = useState(0.2);
    const [tokenLimit, setTokenLimit] = useState(100);

    const effectiveVersion = useMemo(() => version || maxVersion, [version, maxVersion]);

    const isValidExperimentConfig = useMemo(() => {
        return effectiveVersion != null && isValidSemVer(effectiveVersion) && prompt;
    }, [prompt, effectiveVersion]);

    const dropdownItems = useMemo(() => versions.map(v => ({ id: v, value: v })), [versions]);

    return (
        <Card>
            <div className="flex flex-col w-full gap-4">
                <div>
                    <h2 className=" font-semibold text-xl">Run an experiment</h2>
                    <p className=" text-gray-400/80">
                        Run, iterate, and refine prompts before using the model in production.
                        If generation is slow, try adding more resources to your server.
                    </p>
                </div>

                <div className="flex flex-col w-full gap-2">
                    <h3 className=" font-semibold  ">Prompt</h3>
                    <textarea
                        className=" bg-dark-200 focus:border-primary-100 focus:ring-0 focus:shadow-none rounded-sm h-56 text-gray-400"
                        value={prompt}
                        placeholder="Enter prompt..."
                        onChange={(evt) => setPrompt(evt.target.value)} />
                </div>

                <div className="flex flex-row w-full gap-4 justify-start pt-2">
                    <h3 className=" flex-grow font-semibold leading-none">Version</h3>
                    <div className=" items-baseline w-[70%]">
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
                        className="ml-auto w-[70%] focus:border-primary-100 focus:ring-0 focus:shadow-none rounded bg-dark-200 text-gray-400"
                        type="number"
                        step={0.1}
                        min={0.0}
                        value={temperature}
                        onChange={(evt) => setTemperature(evt.target.valueAsNumber)} />
                </div>

                <div className="flex flex-row w-full gap-4 justify-start">
                    <h3 className=" font-semibold leading-none">Token Limit</h3>
                    <input
                        className="ml-auto w-[70%] focus:border-primary-100 focus:ring-0 focus:shadow-none rounded bg-dark-200 text-gray-400"
                        type="number"
                        value={tokenLimit}
                        onChange={(evt) => setTokenLimit(evt.target.valueAsNumber)} />
                </div>

                <div className="flex flex-row w-full gap-4 justify-start">
                    <button className="px-3 py-1.5 bg-primary-100 rounded hover:bg-primary-500 ml-auto disabled:opacity-25 disabled:bg-gray-400" onClick={() => {
                        runExperiment({
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
        </Card>
    )
})

const ExperimentView = React.memo((
    {
        experiment,
        isRunning,
        output
    }: {
        experiment: Experiment,
        isRunning: boolean,
        output: string
    }) => {

    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className={`rounded p-3 outline ${isRunning ? "outline-dark-500" : "outline-primary-400/80"} `}>
            <div className="flex flex-row w-full items-center gap-2">
                <p className=" font-semibold text-lg "> Experiment Prompt </p>
                <div className=" ml-auto hover:bg-gray-300/40 p-2 rounded mb-auto" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? (<Icon icon="collapse-all" size={14} color="#F6F7F9" />) :
                        (<Icon icon="expand-all" size={14} color="#F6F7F9" />)
                    }
                </div>
            </div>
            <div className="flex flex-row w-full items-center">
                <p className="leading-snug whitespace-pre-wrap">{experiment.prompt}</p>
            </div>

            {isExpanded && (
                <>
                    <div className={`my-4 border-t border-gray-400/70 w-1/2 mx-auto `} />
                    <div className="flex flex-row w-full items-center pb-2 gap-2">
                        <p className="font-semibold">Model Output</p>
                        <Pill icon="history" text={experiment.version} color="purple" />
                        <Pill icon="temperature" text={`${experiment.temperature}`} color="purple" />
                        <Pill icon="lengthen-text" text={`${experiment.tokenLimit}`} color="purple" />
                    </div>
                    <div className="flex flex-row w-full items-center">
                        <p className="leading-snug font-mono text-sm whitespace-pre-wrap">
                            {output}
                        </p>
                    </div>
                </>
            )}
        </div>
    )
})

const Experiment = React.memo((
    {
        experiment,
        active,
        output,
    }: ExperimentState
) => {
    return (
        <ExperimentView
            key={experiment.id}
            output={output}
            experiment={experiment}
            isRunning={active} />
    )
})

export default function InferenceExploration({
    model,
}: {
    model: string,
}) {
    const { data: allModels } = useGetModelsQuery();
    const dispatch = useDispatch();

    const versions = useMemo(
        () =>
            allModels
                ? allModels.models.filter(m => m.name === model).flatMap(m => m.versions).map(v => v.version)
                : [], [allModels, model])
    const experiments = useSelector(({ app }) => app.experiments);

    return (
        <>
            <OneColumnLayout>
                <Callout>
                    <h3 className=" text-lg font-semibold text-dark-500 leading-none ">Compleation Experiments</h3>
                    <p className=" text-dark-500 leading-tight mt-2 ">
                        This space allows you to run experiments with models that are deployed to the server.
                        Use this space to explore what is possible and refine your understanding of the boundaries of your model.
                        Experiments do not persist beyond your current session.
                    </p>
                </Callout>
            </OneColumnLayout>
            <TwoColumnLayout type="equal">
                <Column>
                    <ExperimentInput
                        model={model}
                        versions={versions}
                        runExperiment={(experiment) => {
                            dispatch(startActiveExperiment({
                                ...experiment,
                            }))
                        }} />
                </Column>
                <Column>
                    {experiments.length == 0 ? (
                        <div className="flex flex-col h-5/6 w-3/4 mx-auto items-center justify-center">
                            <div className="rounded outline outline-gray-400 p-8 justify-center">
                                <h3 className=" text-lg text-center font-semibold">Start an Experiment</h3>
                                <p className="text-center text-gray-400/60">
                                    Results of your experiments will appear here.
                                    Experiment currently do not persist if you reload the page.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {experiments.map(experiment => (
                                <div className="mb-5">
                                    <Experiment key={experiment.experiment.id} {...experiment} />
                                </div>
                            ))}
                        </>
                    )}
                </Column>
            </TwoColumnLayout>
        </>
    )
}
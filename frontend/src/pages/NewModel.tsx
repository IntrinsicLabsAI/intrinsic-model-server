import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom";
import prettyBytes from 'pretty-bytes';

import { useImportModelMutation, useGetImportStatusQuery } from '../api/services/v1'
import { useGetRepoFilesQuery } from "../api/services/hfService";
import { DiskLocator, FailedTaskState, FinishedTaskState, ModelType, TaskState } from '../api'

import Page from "../components/layout/Page"
import OneColumnLayout from "../components/layout/OneColumnLayout"
import TextInput from "../components/form/TextInput"
import ButtonInput from "../components/form/ButtonInput"

import { endorsedModels } from "../data/endorsedModels"
import { skipToken } from "@reduxjs/toolkit/dist/query";
import InteractiveTable from "../components/core/InteractiveTable";

import { DateTime } from "luxon";

function ProgressBar({
    progress,
    failMessage,
    successMessage,
}: {
    progress: number,
    failMessage?: string,
    successMessage?: string,
}) {
    if (successMessage) {
        return (
            <div>
                <div className="h-1 w-full bg-green-400" />
                <p className="font-mono font-bold text-lg mt-2">{successMessage}</p>
            </div>
        );
    }

    if (failMessage) {
        return (
            <div>
                <div className="h-1 w-full bg-red-600" />
                <p className="font-mono font-bold text-lg mt-2">{failMessage}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="h-1 w-full bg-gray-100 animate-pulse">
                <div className="h-1 bg-blue-700" style={{
                    width: `${Math.round(100 * progress)}%`
                }} />
            </div>
            <p className="text-lg font-bold animate-none mt-2">Loading from HuggingFace Hub...</p>
        </div>
    );
}

function DiskModelForm() {
    const [name, setName] = useState("");
    const [, setVersion] = useState("");
    const [modelType,] = useState<ModelType>(ModelType.COMPLETION);
    const [modelPath, setModelPath] = useState<string>("");
    const [importModelAction] = useImportModelMutation();

    const navigate = useNavigate();

    const importModelHandler = (locator: DiskLocator) => {
        importModelAction(locator);
        // TODO(aduffy): we should actually be redirecting to the model import status page to watch for progress
        navigate("/");
    };

    return (
        <form>
            <div className="flex flex-row pt-4">
                <div className="w-1/3">
                    <p className=" text-lg font-semibold ">Model Name</p>
                </div>
                <div className="w-2/3">
                    <TextInput
                        placeholder="Model Name"
                        onChange={setName}
                        name="model-name" />
                </div>
            </div>
            <div className="flex flex-row pt-4">
                <div className="w-1/3">
                    <p className=" text-lg font-semibold ">Model Version</p>
                </div>
                <div className="w-2/3">
                    <TextInput
                        placeholder="0.1.0"
                        onChange={setVersion}
                        name="model-version" />
                </div>
            </div>
            <div className="flex flex-row pt-4">
                <div className="w-1/3">
                    <p className=" text-lg font-semibold ">Model Path</p>
                </div>
                <div className="w-2/3">
                    <TextInput
                        placeholder="location/of/model.bin"
                        onChange={setModelPath}
                        name="model-path" />
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-primary-400 hover:bg-primary-600 px-3 py-2 text-sm font-semibold text-dark-400 shadow-sm sm:ml-3 sm:w-auto"
                    disabled={!!name || !!modelPath || !!modelType}
                    onClick={() =>
                        importModelHandler({
                            "type": "locatorv1/disk",
                            path: modelPath,
                        })
                    }>
                    Register New Model
                </button>
            </div>
        </form>
    )
}

function HuggingFaceForm() {
    const [selectedModel, setSelectedModel] = useState<string | undefined>();
    const [selectedFile, setSelectedFile] = useState<string | undefined>();
    const submitAllowed = useMemo(() => selectedModel !== undefined && selectedFile !== undefined, [selectedModel, selectedFile]);

    const { data, isLoading } = useGetRepoFilesQuery(selectedModel ?? skipToken, { skip: selectedModel === undefined });
    const [importModelMutation,] = useImportModelMutation();

    const [importJob, setImportJob] = useState<string | undefined>();
    const [, setImportError] = useState<string | undefined>();

    const { data: importData } = useGetImportStatusQuery(importJob ?? skipToken, {
        skip: !importJob,
        pollingInterval: 3_000,
    })

    return (
        <form className=" mt-4 ">
            <div>
                <h3 className=" text-xl font-semibold ">Select a Model</h3>
                <p className=" text-gray-400/80 ">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor et al incididunt ut labore et dolore magna aliqua.
                </p>
                <div className="flex flex-row pt-4 gap-4">
                    <div className="w-1/3">
                        <p className=" font-semibold ">Curated Models</p>
                        <p className=" text-gray-400/80 text-sm italic ">These models are known to be compatible with this Web Server</p>
                    </div>
                    <div className="w-2/3">
                        <div className=" overflow-y-auto p-1">
                            <ButtonInput
                                cols="one"
                                onSelect={setSelectedModel}
                                options={endorsedModels.map((model) => ({
                                    title: model.name,
                                    description: model.description,
                                    value: model.repo
                                }))} />
                        </div>
                    </div>
                </div>
            </div>

            {selectedModel !== undefined && (
                <>
                    <div className="mt-4">
                        <h3 className=" text-xl font-semibold ">Select File</h3>
                        <p className=" text-gray-400/80 ">
                            Showing files available in HuggingFace for <span className=" text-primary-400 font-semibold ">{selectedModel}</span>.
                            The file you select will be the model imported to your web server.
                            To import multiple models, repeat this process for each model.
                        </p>
                        <div className="mt-4">
                            {
                                (!isLoading && data) ?
                                    (<InteractiveTable
                                        enableSelection
                                        onRowSelect={setSelectedFile}
                                        columns={["File Name", "File Size", "Modification Date"]}
                                        rows={data.files?.map((file) => ({
                                            row_key: file.filename,
                                            "File Name": file.filename,
                                            "File Size": prettyBytes(file.size_bytes),
                                            "Modification Date": DateTime.fromISO(file.committed_at).toLocaleString(DateTime.DATETIME_MED),
                                        }))} />) :
                                    (<React.Fragment />)}
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className={`${selectedFile ?
                                " cursor-pointer inline-flex w-full justify-center rounded-md bg-primary-200 hover:bg-primary-400 px-3 py-2 text-sm font-semibold text-dark-400 shadow-sm sm:ml-3 sm:w-auto" :
                                " cursor-not-allowed inline-flex w-full justify-center rounded-md bg-dark-200 px-3 py-2 text-sm font-semibold text-gray-400/70 shadow-sm sm:ml-3 sm:w-auto"}`}
                            disabled={!submitAllowed}
                            onClick={() => {
                                if (selectedModel && selectedFile) {
                                    importModelMutation({
                                        type: 'locatorv1/hf',
                                        repo: selectedModel,
                                        file: selectedFile,
                                    })
                                        .unwrap()
                                        .then(importJobId => {
                                            setImportJob(importJobId);
                                        })
                                        .catch(error => {
                                            // What to do about the error, update that we have a failed to import thing?
                                            setImportJob(undefined);
                                            setImportError(error);
                                        });
                                }
                            }}>
                            Register New Model
                        </button>
                    </div>
                    {importJob &&
                        <div className="mt-4">
                            <ProgressBar progress={0.25}
                                failMessage={importData && isFailedTask(importData) ? importData.error : undefined}
                                successMessage={importData && isFinishedTask(importData) ? (importData.info ?? "Import successful") : undefined} />
                        </div>
                    }
                </>
            )}
        </form>
    )
}

export default function NewModel() {
    const [selection, setSelection] = useState<string | undefined>();

    return (
        <Page>
            <OneColumnLayout type="narrow">
                <div>
                    <h3 className=" font-semibold text-3xl pb-1">Add a new model</h3>
                    <p className=" text-lg text-white/70 pb-2">
                        A model represents a set of binaries that are deployed to the server.
                        Use this to register a new model with the server.
                        Once deployed, models can be run from the Web Portal or via API.
                    </p>
                    <hr className=" border-primary-100" />
                </div>

                <div className="mt-4">
                    <ButtonInput
                        options={[
                            {
                                title: "Import from Disk",
                                description: "Deploy a new model to the Web Server that is already available on your disk.",
                                value: "disk"
                            },
                            {
                                title: "Import from HuggingFace",
                                description: "Select a model from HuggingFace to deploy to your Web Server.",
                                value: "hugging-face"
                            },
                        ]}
                        onSelect={setSelection}
                    />
                </div>

                {!selection && (<React.Fragment />)}
                {(selection && selection === "disk") && (<DiskModelForm />)}
                {(selection && selection === "hugging-face") && (<HuggingFaceForm />)}
            </OneColumnLayout>
        </Page >
    )
}

function isFailedTask(taskState: TaskState): taskState is FailedTaskState {
    return taskState.type === "failed";
}

function isFinishedTask(taskState: TaskState): taskState is FinishedTaskState {
    return taskState.type === "finished";
}
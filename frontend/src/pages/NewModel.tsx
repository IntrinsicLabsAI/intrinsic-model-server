import React, { useState } from "react"
import { useNavigate } from "react-router-dom";

import { useRegisterModelMutation, useInportModelMutation } from '../api/services/baseService'
import { ModelInfo, ModelType } from '../api'
import { useGetHFFilesQuery } from '../api/services/baseService'

import Page from "../components/layout/Page"
import OneColumnLayout from "../components/layout/OneColumnLayout"
import TextInput from "../components/form/TextInput"
import ButtonInput from "../components/form/ButtonInput"

import { endorsedModels } from "../data/endorsedModels"

function DiskModelForm() {
    const [name, setName] = useState("");
    const [version, setVersion] = useState("");
    const [modelType, setModelType] = useState<ModelType>(ModelType.COMPLETION);
    const [modelPath, setModelPath] = useState<string>("");
    const [registerModelAction] = useRegisterModelMutation();

    const navigate = useNavigate();

    const registerHandler = (modelInfo: ModelInfo) => {
        registerModelAction(modelInfo)
        navigate("/")
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
                        setState={setName}
                        name="model-name" />
                </div>
            </div>
            <div className="flex flex-row pt-4">
                <div className="w-1/3">
                    <p className=" text-lg font-semibold ">Model Version</p>
                </div>
                <div className="w-2/3">
                    <TextInput
                        placeholder="0.0.1"
                        setState={setVersion}
                        name="model-version" />
                </div>
            </div>
            <div className="flex flex-row pt-4">
                <div className="w-1/3">
                    <p className=" text-lg font-semibold ">Model Type</p>
                </div>
                <div className="w-2/3">
                    <TextInput
                        disabled
                        placeholder="Compleation"
                        setState={setModelType}
                        name="model-type" />
                </div>
            </div>
            <div className="flex flex-row pt-4">
                <div className="w-1/3">
                    <p className=" text-lg font-semibold ">Model Path</p>
                </div>
                <div className="w-2/3">
                    <TextInput
                        placeholder="location/of/model.bin"
                        setState={setModelPath}
                        name="model-path" />
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-primary-400 hover:bg-primary-600 px-3 py-2 text-sm font-semibold text-dark-400 shadow-sm sm:ml-3 sm:w-auto"
                    disabled={!!name || !!modelPath || !!modelType}
                    onClick={() => {
                        registerHandler({
                            name: name,
                            version: version || undefined,
                            model_type: modelType,
                            model_params: {
                                model_path: modelPath,
                            }
                        })
                    }}>
                    Register New Model
                </button>
            </div>
        </form>
    )
}

function HuggingFaceForm() {
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedFile, setSelectedFile] = useState("");

    const { data, error, isLoading } = useGetHFFilesQuery(selectedModel, {skip: (selectedModel == "")})

    const [registerModelAction] = useInportModelMutation();

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
                        <div className=" overflow-y-auto p-1 max-h-40">
                            <ButtonInput
                                cols="one"
                                setState={setSelectedModel}
                                options={endorsedModels.map((model) => ({
                                    title: model.name,
                                    description: model.description,
                                    value: model.repo
                                }))} />
                        </div>
                    </div>
                </div>
            </div>

            {selectedModel != "" && (
                <>
                    <div className="mt-4">
                        <h3 className=" text-xl font-semibold ">Select File</h3>
                        <p className=" text-gray-400/80 ">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor et al incididunt ut labore et dolore magna aliqua.
                            Showing files for <span className=" text-primary-400 font-semibold ">{selectedModel}</span>.
                        </p>
                        <div className="mt-4">
                            <ButtonInput
                                    cols="four"
                                    setState={setSelectedFile}
                                    options={(!isLoading && data) ? data?.files.map((file) => ({
                                        title: file.filename,
                                        description: `${file.size_bytes}`,
                                        value: file.committed_at
                                    })):[{title: "Andrew Duffy", value: "is great"}]} />
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className={`${selectedFile ? 
                                " cursor-pointer inline-flex w-full justify-center rounded-md bg-primary-200 hover:bg-primary-400 px-3 py-2 text-sm font-semibold text-dark-400 shadow-sm sm:ml-3 sm:w-auto" : 
                                " cursor-not-allowed inline-flex w-full justify-center rounded-md bg-dark-200 px-3 py-2 text-sm font-semibold text-gray-400/70 shadow-sm sm:ml-3 sm:w-auto"}`}
                            onClick={() => {
                                registerModelAction({
                                    type: 'locatorv1/hf',
                                    repo: selectedModel,
                                    file: selectedFile,
                            })}}>
                            Register New Model
                        </button>
                    </div>
                </>
            )}
        </form>
    )
}

export default function NewModel() {
    const [selection, setSelection] = useState("none");

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
                        setState={setSelection}
                    />
                </div>

                {selection == "none" && (<React.Fragment />)}
                {selection == "disk" && (<DiskModelForm />)}
                {selection == "hugging-face" && (<HuggingFaceForm />)}
            </OneColumnLayout>
        </Page >
    )
}
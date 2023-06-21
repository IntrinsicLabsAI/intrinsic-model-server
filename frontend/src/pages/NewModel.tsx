import { useState } from "react"
import { useNavigate } from "react-router-dom";

import { useRegisterModelMutation } from '../api/services/baseService'
import { ModelInfo, ModelType } from '../api'

import Page from "../components/layout/Page"
import OneColumnLayout from "../components/layout/OneColumnLayout"
import TextInput from "../components/form/TextInput"
import ButtonInput from "../components/form/ButtonInput"

export default function NewModel() {
    const [name, setName] = useState("");
    const [version, setVersion] = useState("");
    const [modelType, /* setModelType */] = useState<ModelType>(ModelType.COMPLETION);
    const [modelPath, setModelPath] = useState<string>("");
    const [registerModelAction] = useRegisterModelMutation();
    const [selection, setSelection] = useState("none");

    const navigate = useNavigate();

    const registerHandler = (modelInfo: ModelInfo) => {
        registerModelAction(modelInfo)
        navigate("/")
    };

    const diskForm = (
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
                    // disabled={!!name || !!modelPath || !!modelType}
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
                {selection == "none" && (<div>None Selected</div>)}
                {selection == "disk" && (<>{diskForm}</>)}
                {selection == "hugging-face" && (<p>Hugging Face</p>)}
        </OneColumnLayout>
        </Page >
    )
}
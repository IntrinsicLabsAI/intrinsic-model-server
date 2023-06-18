import OneColumnLayout from "../components/layout/OneColumnLayout"
import Page from "../components/layout/Page"
import { useRegisterModelMutation } from '../api/services/baseService'
import { useState } from "react"
import { ModelInfo, ModelType } from '../api'
import Input from "../components/form/Input"

export default function NewModel() {
    const [name, setName] = useState("");
    const [version, setVersion] = useState("");
    const [modelType, setModelType] = useState<ModelType>(ModelType.COMPLETION);
    const [modelPath, setModelPath] = useState<string>("");
    const [registerModelAction] = useRegisterModelMutation();

    return (
        <Page>
            <OneColumnLayout>
                <div className="flex flex-col w-3/5 mx-auto">
                    <h3 className=" font-semibold text-3xl pb-1">Add a new model</h3>
                    <p className=" text-lg text-white/70 pb-2">
                        A model represents a set of binaries that are deployed to the server.
                        Once deployed, models can be run from the Web Portal or via API.
                        Each model is independently versioned.
                    </p>
                    <hr className=" border-primary-100" />
                    <form>
                        <div className="flex flex-row pt-4">
                            <div className="w-1/3">
                                <p className=" text-lg font-semibold ">Model Name</p>
                            </div>
                            <div className="w-2/3">
                                <Input state="Hello"/>
                            </div>
                        </div>
                        <div className="flex flex-row pt-4">
                            <div className="w-1/3">
                                <p className=" text-lg font-semibold ">Model Type</p>
                            </div>
                            <div className="w-2/3">
                                <input className=" w-full rounded-md" type="text" id="name" name="name" />
                            </div>
                        </div>
                        <div className="flex flex-row pt-4">
                            <div className="w-1/3">
                                <p className=" text-lg font-semibold ">Model Version</p>
                            </div>
                            <div className="w-2/3">
                                <input className=" w-full rounded-md" type="text" id="name" name="name" />
                            </div>
                        </div>
                        <div className="flex flex-row pt-4">
                            <div className="w-1/3">
                                <p className=" text-lg font-semibold ">Model Location</p>
                            </div>
                            <div className="w-2/3">
                                <input className=" w-full rounded-md" type="text" id="name" name="name" />
                            </div>
                        </div>
                    </form>
                </div>
            </OneColumnLayout>
        </Page>
    )
}
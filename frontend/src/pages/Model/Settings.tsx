import { useGetModelsQuery } from "../../api/services/v1";
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useUpdateModelNameMutation, useDeleteModelMutation } from "../../api/services/v1"

import TextInput from "../../components/form/TextInput"
import Card from "../../components/core/Card";
import Column from "../../components/layout/Column";
import OneColumnLayout from "../../components/layout/OneColumnLayout";
import { Icon } from "@blueprintjs/core";
import Button from "../../components/core/Button";

const VALIDATION_REGEX = /^[a-zA-Z0-9-_.]+$/;

export default function Settings() {
    const { name } = useParams<"name">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const modelName = name!;

    const { registeredModel } = useGetModelsQuery(undefined, {
        selectFromResult: ({ data }) => ({ registeredModel: data?.models.find(m => m.name === modelName) })
    })

    const [newName, setNewName] = useState<string>("")
    const [updateNameAction] = useUpdateModelNameMutation();
    const [deleteModelAction] = useDeleteModelMutation();

    const navigate = useNavigate();

    const isValid = useMemo(() => {
        return VALIDATION_REGEX.test(newName);
    }, [newName]);

    const updateMetadata = (
        <>
            <div>
                <h3 className="text-xl font-semibold">Update Metadata</h3>
                <p className=" text-gray-400/80 ">
                    Change the metadata associated with the model's registration. 
                    Currently, only Model Name can be updated.
                    Exercise caution when updating the name of your model.
                    Though the UUID will remain stable, updating the name may break any clients which leverage the server's generated API.
                </p>
            </div>
            <div className="flex flex-row w-full h-fit pt-2">
                <div className="bg-primary-600 -mt-1 mr-6 w-0.5"></div>
                <div className="flex flex-col w-full gap-4">
                    {/* Logic to change the name of the model */}
                    <form className="flex flex-row gap-2 w-full">
                        <div className="flex flex-col items-start basis-52">
                            <p className=" font-semibold leading-none">Model Name</p>
                            {(newName !== "" && !isValid) && <p className="font-medium text-red-400">Please enter a valid name.</p>}
                        </div>
                        <div className=" w-5/12 ">
                            <TextInput placeholder={registeredModel?.name} name="model-name" onChange={setNewName} />
                        </div>
                        <button
                            className=" outline outline-primary-600 px-2 py-1 rounded bg-primary-400 disabled:outline-gray-600 disabled:opacity-25 disabled:bg-gray-400"
                            disabled={newName === "" || !isValid}
                            onClick={() => {
                                updateNameAction({ modelName: modelName, name: newName })
                                setNewName("")
                                navigate(`/model/${newName}/settings`)
                            }}>
                            <Icon icon="tick" size={24} />
                        </button>
                    </form>
                    <form className="flex flex-row gap-2 w-full">
                        <div className="flex flex-col items-start basis-52">
                            <p className=" font-semibold leading-none">UUID</p>
                        </div>
                        <div className=" w-5/12 ">
                            <TextInput disabled placeholder={registeredModel?.id} name="model-id" />
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
    
    const deleteModel = (
        <div>
            <h3 className="text-xl font-semibold">Delete Model</h3>
            <p className=" text-gray-400/80 ">
                Delete your model and all associated imported versions from the server.
                The model will no longer be available and all experiments will be permanently deleted.
                Please proceed with caution, there is no way to undo this action.
            </p>
            <div className="flex flex-row w-fit pt-2">
                <Button type="text" buttonIcon="trash" buttonText="Delete Model" onAction={() => { 
                    deleteModelAction(modelName)
                    navigate("/")
                }} />
            </div>
        </div>
    )

    return (
        <OneColumnLayout>
            <Column>
                <Card>
                    <div className="flex flex-col gap-4 w-full">
                        <div>
                            <h2 className="text-2xl font-semibold">Manage Settings for Model</h2>
                            <p className=" text-gray-400/80 ">Use this to manage settings for your model, associated metadata, and the respective versions of the model which have been registered with the server.</p>
                        </div>
                        {updateMetadata}
                        {deleteModel}
                    </div>
                </Card>
            </Column>
        </OneColumnLayout>
    )
}
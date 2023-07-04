import { useGetModelsQuery } from "../../api/services/v1";
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useUpdateModelNameMutation } from "../../api/services/v1"

import TextInput from "../../components/form/TextInput"
import Card from "../../components/core/Card";
import Column from "../../components/layout/Column";
import OneColumnLayout from "../../components/layout/OneColumnLayout";
import { Icon } from "@blueprintjs/core";

const VALIDATION_REGEX = /^[a-zA-Z0-9-_.]+$/;

export default function Settings() {
    const { name } = useParams<"name">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const modelName = name!;

    const { registeredModel } = useGetModelsQuery(undefined, {
        selectFromResult: ({ data }) => ({ registeredModel: data?.models.find(m => m.name === modelName) })
    })

    const [ newName, setNewName ] = useState<string>("")
    const [ updateNameAction ] = useUpdateModelNameMutation();
    const navigate = useNavigate();

    const isValid = useMemo(() => {
        return VALIDATION_REGEX.test(newName);
    }, [newName]);

    return (
        <OneColumnLayout>
            <Column>
                <Card>
                    <div className="flex flex-col gap-4 w-full">
                        <div>
                            <h2 className="text-2xl font-semibold">Manage Settings for Model</h2>
                            <p className=" text-gray-400/80 ">Use this to manage settings for your model, associated metadata, and the respective versions of the model which have been registered with the server.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Update Metadata</h3>
                        </div>
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
                    </div>
                </Card>
            </Column>
        </OneColumnLayout>
    )
}
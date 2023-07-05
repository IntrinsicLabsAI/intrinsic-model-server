import { useGetModelsQuery } from "../../api/services/v1";
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useUpdateModelNameMutation, useDeleteModelMutation, useDeleteModelVersionMutation } from "../../api/services/v1"
import { DateTime } from "luxon";

import TextInput from "../../components/form/TextInput"
import Card from "../../components/core/Card";
import Column from "../../components/layout/Column";
import { Icon } from "@blueprintjs/core";
import Button from "../../components/core/Button";
import InteractiveTable from "../../components/core/InteractiveTable";
import TwoColumnLayout from "../../components/layout/TwoColumnLayout";

const VALIDATION_REGEX = /^[a-zA-Z0-9-_.]+$/;

export default function Settings() {
    const { name } = useParams<"name">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const modelName = name!;

    const { registeredModel } = useGetModelsQuery(undefined, {
        selectFromResult: ({ data }) => ({ registeredModel: data?.models.find(m => m.name === modelName) })
    })

    const [newName, setNewName] = useState<string>("")
    const [settingsTab, setSettingTab] = useState<string>("general")
    const [versionSelection, setVersionSelection] = useState<string>("")

    const [updateNameAction] = useUpdateModelNameMutation();
    const [deleteModelAction] = useDeleteModelMutation();
    const [deleteModelVersionAction] = useDeleteModelVersionMutation();

    const navigate = useNavigate();

    const isValid = useMemo(() => {
        return VALIDATION_REGEX.test(newName);
    }, [newName]);

    const rows = registeredModel?.versions.map(v => ({
        row_key: v.version,
        Version: v.version,
        Type: v.import_metadata?.source.type || "Unkown",
        Date: DateTime.fromISO(v.import_metadata?.imported_at).toLocaleString(DateTime.DATETIME_MED),
    })) || []

    const modelVersions = (
        <>
            <h3 className="text-2xl font-semibold">Model Versions</h3>
            <div>
                <h3 className="text-xl font-semibold">Delete Version</h3>
                <p className=" text-gray-400/80 ">
                    Delete one of the currently registered versions of this model.
                    If you delete a version, it will delete all associated experiments as well.
                </p>
            </div>
            <InteractiveTable
                enableSelection
                onRowSelect={setVersionSelection}
                rows={rows}
                columns={["Version", "Type", "Date"]} />
            <div className="w-fit">
                <Button type="text"
                    buttonText="Delete Version"
                    disabled={versionSelection === ""}
                    onAction={() => {
                        deleteModelVersionAction({ model: modelName, version: versionSelection })
                        navigate("/")
                    }} />
            </div>
        </>
    )

    const generalSettings = (
        <>
            <h3 className="text-2xl font-semibold">General</h3>
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
            <div>
                <h3 className="text-xl font-semibold">Delete Model</h3>
                <p className=" text-gray-400/80 ">
                    Delete your model and all associated imported versions from the server.
                    The model will no longer be available and all experiments will be permanently deleted.
                    Please proceed with caution, there is no way to undo this action.
                </p>
                <div className="flex flex-row w-fit mt-4 gap-2 cursor-pointer"
                    onClick={() => {
                        deleteModelAction(modelName)
                        navigate("/")
                    }}>
                    <Icon icon="trash" size={14} color="#f1616f" />
                    <p className=" font-semibold text-red-400 leading-none"> Delete this model and all associated versions and experiments. </p>
                </div>
            </div>
        </>
    )

    return (
        <TwoColumnLayout type="rightWide">
            <Column>
                <Card className=" h-60 w-80 ">
                    <p className=" font-semibold text-lg pb-4">Settings</p>
                    <p className={` cursor-pointer font-semibold pb-1 ${settingsTab === "general" ? " text-primary-600 " : ""}`}
                        onClick={() => setSettingTab("general")}>
                        General
                    </p>
                    <p className={` cursor-pointer font-semibold pb-1 ${settingsTab === "versions" ? " text-primary-600 " : ""}`}
                        onClick={() => setSettingTab("versions")}>
                        Model Versions
                    </p>
                </Card>
            </Column>
            <Column>
                <Card className=" h-fit ">
                    <div className="flex flex-col gap-4 w-full">
                        {settingsTab === "general" && generalSettings}
                        {settingsTab === "versions" && modelVersions}
                    </div>
                </Card>
            </Column>
        </TwoColumnLayout>
    )
}
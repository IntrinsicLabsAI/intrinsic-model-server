import { useGetModelsQuery } from "../../api/services/v1";
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGetRepoFilesQuery } from "../../api/services/hfService";
import { skipToken } from "@reduxjs/toolkit/dist/query";

import {
    useUpdateModelNameMutation,
    useDeleteModelMutation,
    useDeleteModelVersionMutation,
} from "../../api/services/v1";
import { DateTime } from "luxon";

import TextInput from "../../components/form/TextInput";
import Card from "../../components/core/Card";
import Column from "../../components/layout/Column";
import { Icon } from "@blueprintjs/core";
import Button from "../../components/core/Button";
import InteractiveTable from "../../components/core/InteractiveTable";
import TwoColumnLayout from "../../components/layout/TwoColumnLayout";
import { HFFile } from "../../api";
import prettyBytes from "pretty-bytes";

const VALIDATION_REGEX = /^[a-zA-Z0-9-_.]+$/;

export default function Settings() {
    const { name } = useParams<"name">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const modelName = name!;

    const { registeredModel } = useGetModelsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            registeredModel: data?.models.find((m) => m.name === modelName),
        }),
    });

    const [newName, setNewName] = useState<string>("");
    const [settingsTab, setSettingTab] = useState<string>("general");
    const [versionSelection, setVersionSelection] = useState<string>("");
    const [checkedForUpdate, setCheckedForUpdate] = useState<boolean>(false);
    const [availableFilesForImport, setAvailableFilesForImport] = useState<HFFile[]>([]);
    const [selectedFileForImport, setSelectedFileForImport] = useState<string>("");

    const [updateNameAction] = useUpdateModelNameMutation();
    const [deleteModelAction] = useDeleteModelMutation();
    const [deleteModelVersionAction] = useDeleteModelVersionMutation();

    const navigate = useNavigate();

    const isValid = useMemo(() => {
        return VALIDATION_REGEX.test(newName);
    }, [newName]);

    const { data } = useGetRepoFilesQuery(
        registeredModel?.versions[0].import_metadata.source.source.repo ?? skipToken,
        {
            skip: registeredModel?.name === undefined,
        }
    );

    const checkForUpdate = () => {
        if (!registeredModel) {
            return;
        }

        const availableFiles: HFFile[] = [];

        const importTime = DateTime.fromISO(
            registeredModel?.versions[0].import_metadata.imported_at
        );

        console.log(data);

        data?.files.forEach((f) => {
            if (importTime < DateTime.fromISO(f.committed_at)) {
                availableFiles.push(f);
            }
        });

        setAvailableFilesForImport(availableFiles);
        setCheckedForUpdate(true);
    };

    const rows =
        registeredModel?.versions.map((v) => ({
            row_key: v.version,
            Version: v.version,
            Type: v.import_metadata?.source.type || "Unkown",
            Date: DateTime.fromISO(v.import_metadata?.imported_at).toLocaleString(
                DateTime.DATETIME_MED
            ),
        })) || [];

    const modelVersions = (
        <>
            <h3 className="text-2xl font-semibold">Model Versions</h3>
            <div>
                <h3 className="text-xl font-semibold">Import New Version</h3>
                <p className=" text-gray-400/80 ">
                    Update the currently registered versions of this model. This update will not
                    impact experiments or tasks that have already been created. You will need to
                    update those independently.
                </p>
                {!checkedForUpdate && (
                    <div className="w-fit mt-4">
                        <Button
                            buttonText="Check for Updates"
                            onAction={() => {
                                checkForUpdate();
                            }}
                        />
                    </div>
                )}
                {checkedForUpdate && (
                    <>
                        {availableFilesForImport.length ? (
                            <div className="mt-2">
                                <InteractiveTable
                                    enableSelection
                                    onRowSelect={setSelectedFileForImport}
                                    rows={availableFilesForImport.map((f) => ({
                                        row_key: f.filename,
                                        "File Name": f.filename,
                                        "File Size": prettyBytes(f.size_bytes),
                                        Date: DateTime.fromISO(f.committed_at).toLocaleString(
                                            DateTime.DATETIME_MED
                                        ),
                                    }))}
                                    columns={["File Name", "File Size", "Date"]}
                                />
                                <div className="flex gap-2 w-fit mt-4">
                                    <Button
                                        buttonText="Import Version"
                                        disabled={!selectedFileForImport}
                                        onAction={() => {
                                            console.log("Import Model Now!");
                                            // Add import here to finalize this feature.
                                        }}
                                    />
                                    <Button
                                        buttonText="Cancel"
                                        outline={false}
                                        onAction={() => {
                                            setCheckedForUpdate(false);
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className=" mt-2">
                                <p className=" font-semibold">
                                    There are no new versions of this model available from
                                    HuggingFace.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div>
                <h3 className="text-xl font-semibold">Delete Version</h3>
                <p className=" text-gray-400/80 ">
                    Delete one of the currently registered versions of this model. If you delete a
                    version, it will delete all associated experiments as well.
                </p>
            </div>
            <InteractiveTable
                enableSelection
                onRowSelect={setVersionSelection}
                rows={rows}
                columns={["Version", "Type", "Date"]}
            />
            <div className="w-fit">
                <Button
                    buttonText="Delete Version"
                    disabled={versionSelection === ""}
                    onAction={() => {
                        deleteModelVersionAction({
                            model: modelName,
                            version: versionSelection,
                        });
                        navigate("/");
                    }}
                />
            </div>
        </>
    );

    const generalSettings = (
        <>
            <h3 className="text-2xl font-semibold">General</h3>
            <div>
                <h3 className="text-xl font-semibold">Rename</h3>
                <p className=" text-gray-400/80 ">
                    Update the name of the model. Model names may only include alphanumeric
                    characters, as well as periods, underscores and dashes. Note that updating the
                    name of the model may break downstream API consumers.
                </p>
            </div>
            <div className="flex flex-row w-full h-fit pt-2">
                <div className="bg-primary-600 -mt-1 mr-6 w-0.5"></div>
                <div className="flex flex-col w-full gap-4">
                    {/* Logic to change the name of the model */}
                    <form className="flex flex-row gap-2 w-full">
                        <div className="flex flex-col items-start basis-52">
                            <p className=" font-semibold leading-none">Model Name</p>
                            {newName !== "" && !isValid && (
                                <p className="font-medium text-red-400">
                                    Please enter a valid name.
                                </p>
                            )}
                        </div>
                        <div className=" w-5/12 ">
                            <TextInput
                                placeholder={registeredModel?.name}
                                name="model-name"
                                onChange={setNewName}
                            />
                        </div>
                        <button
                            className=" outline outline-primary-600 px-2 py-1 rounded bg-primary-400 disabled:outline-gray-600 disabled:opacity-25 disabled:bg-gray-400"
                            disabled={!isValid}
                            onClick={() => {
                                updateNameAction({
                                    modelName: modelName,
                                    name: newName,
                                });
                                setNewName("");
                                navigate(`/model/${newName}/settings`);
                            }}
                        >
                            <Icon icon="tick" size={24} />
                        </button>
                    </form>
                    <form
                        className="flex flex-row gap-2 w-full"
                        onSubmit={(evt) => evt.preventDefault()}
                    >
                        <div className="flex flex-col items-start basis-52">
                            <p className=" font-semibold leading-none">UUID</p>
                        </div>
                        <div className=" w-5/12 ">
                            <TextInput disabled placeholder={registeredModel?.id} name="model-id" />
                        </div>
                        <button
                            className="animate-wiggle outline outline-primary-600/50 px-2 py-1 rounded bg-primary-400 disabled:outline-gray-600 disabled:opacity-25 disabled:bg-gray-400"
                            // className="hover:animate-bounce"
                            onClick={(evt) => {
                                evt.preventDefault();
                                if (registeredModel?.id) {
                                    navigator.clipboard.writeText(registeredModel.id);
                                }
                            }}
                        >
                            <Icon icon="clipboard" size={24} />
                        </button>
                    </form>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold">Delete Model</h3>
                <p className=" text-gray-400/80 ">
                    Delete your model and all associated imported versions from the server. The
                    model will no longer be available and all saved experiments will be permanently
                    deleted as well. Please proceed with caution, there is no way to undo this
                    action.
                </p>
                <div
                    className="flex flex-row w-fit mt-4 gap-2 cursor-pointer hover:bg-red-400/30 p-3 rounded-lg"
                    onClick={() => {
                        deleteModelAction(modelName);
                        navigate("/");
                    }}
                >
                    <Icon icon="trash" size={14} color="#f1616f" />
                    <p className=" font-semibold text-red-400 leading-none"> Permanently Delete </p>
                </div>
            </div>
        </>
    );

    return (
        <TwoColumnLayout type="rightWide">
            <Column>
                <Card className=" h-60 w-80 ">
                    <p className=" font-semibold text-lg pb-4">Settings</p>
                    <p
                        className={` cursor-pointer font-semibold pb-1 ${
                            settingsTab === "general" ? " text-primary-600 " : ""
                        }`}
                        onClick={() => setSettingTab("general")}
                    >
                        General
                    </p>
                    <p
                        className={` cursor-pointer font-semibold pb-1 ${
                            settingsTab === "versions" ? " text-primary-600 " : ""
                        }`}
                        onClick={() => setSettingTab("versions")}
                    >
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
    );
}

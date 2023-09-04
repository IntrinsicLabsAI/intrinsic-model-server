import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
    useGetModelsQuery,
    useGetTasksQuery,
    useRenameTaskMutation,
    useUpdateModelNameMutation,
    useUpdateTaskInputsMutation,
    useUpdateTaskModelMutation,
    useUpdateTaskPromptMutation,
} from "../api/services/v1";

import Page from "../components/layout/Page";
import TwoColumnLayout from "../components/layout/TwoColumnLayout";
import Column from "../components/layout/Column";
import Card from "../components/core/Card";
import Button from "../components/core/Button";
import Callout from "../components/core/Callout";
import { TaskInfo } from "../api";
import Dropdown from "../components/core/Dropdown";
import { Icon } from "@blueprintjs/core";

function TaskHeader({ task }: { task: string }) {
    const navigate = useNavigate();
    const [isEditing, setEditing] = useState<boolean>(false);
    const [taskName, setTaskName] = useState<string>(task);

    const [createTaskAction] = useRenameTaskMutation();

    const toggleEditing = () => {
        if (!isEditing) {
            setEditing(true);
        } else if (isEditing) {
            createTaskAction({ taskName: task, newName: taskName });
            navigate(`/task/${taskName}`);
            setEditing(false);
        }
    };

    return (
        <div className="flex flex-row items-start pb-5">
            <div className=" flex flex-col gap-2 mr-auto">
                <div className=" flex flex-row items-center gap-2 group">
                    <>
                        {isEditing ? (
                            <>
                                <input
                                    value={taskName}
                                    type="text"
                                    onChange={(evt) => setTaskName(evt.target.value)}
                                    className=" font-semibold text-xl text-gray-400 bg-transparent focus:ring-0 focus:outline-primary-400 shadow-none outline border-none p-1 rounded-sm w-1/2"
                                />
                                <Button
                                    buttonIcon="tick"
                                    color="primary"
                                    style="bold"
                                    size="medium"
                                    outline={false}
                                    onAction={() => toggleEditing()}
                                />
                            </>
                        ) : (
                            <h2
                                className=" font-semibold text-2xl cursor-text "
                                onClick={() => toggleEditing()}
                            >
                                {task}
                            </h2>
                        )}
                    </>
                </div>
            </div>
            <Button buttonText="Actions" style="minimal" size="medium" />
        </div>
    );
}

function TaskStatus() {
    const [statusActive, setStatusActive] = useState<boolean>(true);
    return (
        <div className="mb-5">
            {statusActive ? (
                <Callout color="green">
                    <div className=" flex flex-row gap-2 items-center">
                        <div className="mr-auto">
                            <h3 className="text-lg font-semibold text-dark-300 leading-none">
                                This task is active and accepting requests
                            </h3>
                        </div>
                        <Button
                            size="small"
                            style="minimal"
                            buttonText="Disable"
                            buttonIcon="disable"
                            color="dark"
                            onAction={() => setStatusActive(!statusActive)}
                        />
                    </div>
                </Callout>
            ) : (
                <Callout color="red">
                    <div className=" flex flex-row gap-2 items-center">
                        <div className="mr-auto">
                            <h3 className="text-lg font-semibold text-dark-300 leading-none">
                                This task is disable and not accepting requests.
                            </h3>
                        </div>
                        <Button
                            size="small"
                            style="minimal"
                            buttonText="Active"
                            buttonIcon="offline"
                            color="dark"
                            onAction={() => setStatusActive(!statusActive)}
                        />
                    </div>
                </Callout>
            )}
        </div>
    );
}

function TaskInstructions({ task }: { task: TaskInfo }) {
    const [taskPrompt, setTaskPrompt] = useState<string>(task.prompt_template);
    const [isEditingTaskPrompt, setIsEditingTaskPrompt] = useState<boolean>(false);
    const [updatePromptAction] = useUpdateTaskPromptMutation();

    const savePrompt = () => {
        if (taskPrompt) {
            updatePromptAction({ taskName: task.name, prompt: taskPrompt });
            setIsEditingTaskPrompt(false);
        } else {
            updatePromptAction({ taskName: task.name, prompt: "" });
            setIsEditingTaskPrompt(false);
        }
    };

    return (
        <Card className="mb-5">
            <div className="flex flex-col w-full gap-4">
                <div className=" flex flex-row">
                    <div className="mr-auto items-start">
                        <h2 className=" font-semibold text-xl">Task Instructions</h2>
                        <p className=" text-gray-400/80">
                            Define a prompt to be used when running this task.
                        </p>
                    </div>
                    <div>
                        {isEditingTaskPrompt ? (
                            <Button
                                size="medium"
                                color="primary"
                                style="bold"
                                outline={false}
                                buttonIcon="tick"
                                onAction={() => savePrompt()}
                            />
                        ) : (
                            <Button
                                size="medium"
                                style="minimal"
                                outline={false}
                                buttonIcon="edit"
                                onAction={() => setIsEditingTaskPrompt(true)}
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-col w-full gap-2">
                    <textarea
                        className=" bg-dark-200 disabled:bg-transparent focus:border-primary-100 border-gray-200/60 focus:ring-0 focus:shadow-none rounded-sm h-56 text-gray-400"
                        disabled={!isEditingTaskPrompt}
                        value={taskPrompt}
                        placeholder="Enter prompt..."
                        onChange={(evt) => setTaskPrompt(evt.target.value)}
                    />
                </div>
            </div>
        </Card>
    );
}

function TaskValidation() {
    const [validationActive, setValidationActive] = useState<boolean>(false);
    return (
        <Card>
            <div className=" flex flex-row gap-2 items-center">
                <div className="mr-auto">
                    <h3 className="text-lg font-semibold leading-none">Output Validation</h3>
                </div>
                {!validationActive ? (
                    <Button
                        size="medium"
                        style="minimal"
                        buttonText="Disabled"
                        color="default"
                        outline={true}
                        onAction={() => setValidationActive(!validationActive)}
                    />
                ) : (
                    <Button
                        size="medium"
                        style="bold"
                        buttonText="Enabled"
                        color="default"
                        outline={true}
                        onAction={() => setValidationActive(!validationActive)}
                    />
                )}
            </div>
            {validationActive && (
                <div className="flex flex-col gap-2 mt-4">
                    <p className=" leading-tight ">
                        If your model supports grammer defined output validation, you can use this
                        feature to constrain the output generated when running this task. Learn more
                        here.
                    </p>
                </div>
            )}
        </Card>
    );
}

function TaskSidebarInputs({
    name,
    type,
    onSave,
    onDelete,
}: {
    name: string;
    type: string;
    onSave: (name: string, newName: string) => void;
    onDelete: (name: string) => void;
}) {
    const [inputName, setInputName] = useState<string>(name);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const toggleEditing = () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        } else {
            onSave(name, inputName);
            setIsEditing(false);
            return;
        }
    };

    return (
        <>
            <div className=" flex flex-row items-center outline outline-2 outline-slate-200/80 p-2 rounded-md">
                {!isEditing ? (
                    <>
                        <p className=" font-bold pr-2">{inputName}</p>
                        <p className=" text-slate-200/80 mr-auto">{type}</p>
                        <Button
                            buttonIcon="edit"
                            size="medium"
                            style="minimal"
                            outline={false}
                            onAction={() => toggleEditing()}
                        />
                        <Button
                            buttonIcon="trash"
                            size="medium"
                            style="minimal"
                            outline={false}
                            onAction={() => onDelete(inputName)}
                        />
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            value={inputName}
                            onChange={(evt) => setInputName(evt.target.value)}
                            className=" mr-auto font-semibold text-gray-400 bg-dark-200 focus:ring-0 focus:outline-none shadow-none border-none pl-2 rounded-sm w-full"
                        />
                        <div className="ml-1" />
                        <Button
                            buttonIcon="tick"
                            size="medium"
                            style="bold"
                            color="primary"
                            outline={false}
                            onAction={() => toggleEditing()}
                        />
                    </>
                )}
            </div>
        </>
    );
}

function TaskSidebarModel({ task }: { task: TaskInfo }) {
    const { data, isLoading } = useGetModelsQuery();

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [selectedModelVersion, setSelectedModelVersion] = useState<string>("");
    const [updateTaskModel] = useUpdateTaskModelMutation();

    const saveModel = () => {
        const modelId = data?.models.find(m => m.name == selectedModel)?.id;
        updateTaskModel({
            task: task.name, 
            model: {
                model_version: selectedModelVersion,
                model_id: modelId
            }
        })
        setIsEditing(!isEditing);
    }

    return (
        <Card className="mb-2">
            {!isEditing && (
                <>
                    <div className="flex flex-row gap-2 items-center pb-2">
                        <p className=" font-semibold text-lg mr-auto">Linked Model</p>
                        <Button
                            buttonText="Change"
                            size="medium"
                            style="minimal"
                            color="default"
                            outline={false}
                            onAction={() => setIsEditing(!isEditing)}
                        />
                    </div>
                    <div className=" flex flex-row items-start gap-2">
                        <div className=" rounded bg-purple-600 p-3">
                            <Icon icon="application" size={20} color="#1C2127" />
                        </div>
                        <div className="flex flex-col whitespace-nowrap truncate">
                            <Link to={`/model/${data?.models.find(m => m.id == task.model_id)?.name}`}>
                                <p className=" font-semibold leading-snug truncate cursor-pointer">
                                    {data?.models.find(m => m.id == task.model_id)?.name}
                                </p>
                            </Link>
                            <p className=" text-gray-200/80 leading-snug">
                                Version: {task.model_version}
                            </p>
                        </div>
                    </div>
                </>
            )}
            {isEditing && (
                <>
                    <div className="flex flex-row gap-2 items-center pb-2">
                        <p className=" font-semibold text-lg mr-auto">Linked Model</p>
                        <Button
                            buttonText="Save"
                            size="medium"
                            style="minimal"
                            color="default"
                            outline={true}
                            onAction={() => saveModel()}
                        />
                    </div>
                    <div className=" flex flex-col gap-2">
                        <p className=" whitespace-pre-wrap leading-tight text-slate-200/90 mb-2">
                            Select which model your task uses when it runs. You can select any model currently registered.
                        </p>
                        {!isLoading &&
                            <>
                                <div className="flex flex-row gap-2 items-start mb-2">
                                    <p className="hover:cursor-pointer w-20">
                                        Model
                                    </p>
                                    <Dropdown
                                        buttonText="Models" 
                                        onSelectionChange={(k) => setSelectedModel(`${k}`)}
                                        items={data?.models.map((m) => ({ id: m.name, value: m.name })) ?? []}/>
                                </div>
                                <div className="flex flex-row gap-2 items-start">
                                    <p className="hover:cursor-pointer w-20">
                                        Version
                                    </p>
                                    <Dropdown
                                        buttonText="Versions" 
                                        onSelectionChange={(k) => setSelectedModelVersion(`${k}`)}
                                        items={data?.models.find(m => m.name == selectedModel)?.versions.map(v => ({id: v.version, value: v.version})) ?? []}/>
                                </div>
                            </>
                        }
                    </div>
                </>
            )}
        </Card>
    );
}

function TaskSidebar({ task }: { task: TaskInfo }) {
    const [updateInputsAction] = useUpdateTaskInputsMutation();

    const onCreate = () => {
        var updatedInputs: Record<string, string> = {};
        for (const pName in task.task_params) {
            updatedInputs[pName] = "string";
        }

        updatedInputs[`new-input ${Object.getOwnPropertyNames(updatedInputs).length + 1}`] =
            "string";
        updateInputsAction({ taskName: task.name, inputs: updatedInputs });
    };

    const onDelete = (name: string) => {
        var updatedInputs: Record<string, string> = {};
        for (const pName in task.task_params) {
            if (pName === name) {
                continue;
            } else {
                updatedInputs[pName] = "string";
            }
        }
        updateInputsAction({ taskName: task.name, inputs: updatedInputs });
    };

    const onSave = (name: string, newName: string) => {
        var updatedInputs: Record<string, string> = {};
        for (const pName in task.task_params) {
            if (pName === name) {
                updatedInputs[newName] = "string";
            } else {
                updatedInputs[pName] = "string";
            }
        }
        updateInputsAction({ taskName: task.name, inputs: updatedInputs });
    };

    return (
        <>
            <Card className="mb-5">
                <div className="flex flex-row gap-2 items-center pb-2">
                    <div className=" mr-auto ">
                        <p className=" font-semibold text-lg leading-none">Inputs</p>
                    </div>
                    <Button
                        buttonIcon="plus"
                        size="medium"
                        style="minimal"
                        color="primary"
                        outline={false}
                        onAction={() => onCreate()}
                    />
                </div>
                <div className=" flex flex-col gap-4 ">
                    {Object.getOwnPropertyNames(task.task_params)
                        .sort()
                        .map((name) => (
                            <TaskSidebarInputs
                                name={name}
                                type={task.task_params[name]}
                                onSave={onSave}
                                onDelete={onDelete}
                            />
                        ))}
                </div>
            </Card>
            <TaskSidebarModel task={task} />
        </>
    );
}

function TaskPage({ task }: { task: TaskInfo }) {
    return (
        <TwoColumnLayout type="right">
            <Column>
                <TaskSidebar task={task} />
            </Column>
            <Column>
                <TaskInstructions task={task} />
                <TaskValidation />
            </Column>
        </TwoColumnLayout>
    );
}

export default function Task() {
    const navigate = useNavigate();
    const { taskid } = useParams<"taskid">();

    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const taskName = taskid!;

    const { registeredTask, isLoading } = useGetTasksQuery(undefined, {
        selectFromResult: ({ data, isLoading }) => ({
            registeredTask: data?.find((m) => m.name === taskName),
            isLoading,
        }),
    });

    if (registeredTask === undefined && !isLoading) {
        navigate("/404");
    }

    return (
        <Page header={<TaskHeader task={taskName} />}>
            <TaskStatus />
            {registeredTask && <TaskPage task={registeredTask} />}
        </Page>
    );
}

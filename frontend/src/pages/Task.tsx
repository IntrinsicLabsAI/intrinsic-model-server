import { useParams } from "react-router-dom";
import { useState } from "react";
// import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated/16px/blueprint-icons-16.ts";
// import { Icon } from "@blueprintjs/core";

import Page from "../components/layout/Page";
import TwoColumnLayout from "../components/layout/TwoColumnLayout";
import Column from "../components/layout/Column";
import Card from "../components/core/Card";
import Button from "../components/core/Button";
import Callout from "../components/core/Callout";
import { Icon } from "@blueprintjs/core";
import Dropdown from "../components/core/Dropdown";

function TaskHeader({ task }: { task: string }) {
    return (
        <div className="flex flex-row items-start pb-5">
            <div className=" flex flex-col gap-2 mr-auto">
                <h2 className=" font-semibold text-2xl leading-none">Very Important Task</h2>
                <p className=" text-gray-400/80">
                    Description of this task. This is shown in other UIs to provide context on what this task does.
                </p>
            </div>
            <Button buttonText="Actions" style="minimal" size="medium" />
        </div>
    );
}

function TaskStatus(){
    const [statusActive, setStatusActive] = useState<boolean>(true);
    return (
        <div className="mb-4">
            {statusActive ? 
                (<Callout color="green">
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
                            onAction={() => setStatusActive(!statusActive)}/>
                    </div>
                </Callout>) :
                (<Callout color="red">
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
                            onAction={() => setStatusActive(!statusActive)}/>
                    </div>
                </Callout>)
            }
        </div>
    )
}

function TaskInstructions() {
    const [taskPrompt, setTaskPrompt] = useState<string | undefined>();
    const [isEditingTaskPrompt, setIsEditingTaskPrompt] = useState<boolean>(false);
    return (
        <Card className="mb-4">
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
                                onAction={() => setIsEditingTaskPrompt(false)}
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
                        className=" bg-dark-200 focus:border-primary-100 border-gray-200/60 focus:ring-0 focus:shadow-none rounded-sm h-56 text-gray-400"
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
                    <h3 className="text-lg font-semibold leading-none">
                        Output Validation
                    </h3>
                </div>
                {!validationActive ? 
                    (<Button
                        size="medium"
                        style="minimal"
                        buttonText="Disabled"
                        color="default"
                        outline={true}
                        onAction={() => setValidationActive(!validationActive)}/>) :
                    (<Button
                        size="medium"
                        style="bold"
                        buttonText="Enabled"
                        color="default"
                        outline={true}
                        onAction={() => setValidationActive(!validationActive)}/>)
                }
            </div>
            {validationActive && (
                <div className="flex flex-col gap-2 mt-4">
                    <p className=" leading-tight ">
                        If your model supports grammer defined output validation, you can use this feature to constrain the output generated when running this task.
                        Learn more here.
                    </p>
                </div>
            )}
        </Card>        
    )
}

function TaskSidebarInputs(
    {
        name,
        unique_key
    } :
    {
        name: string,
        unique_key: string
    }
) {
    const [inputName, setInputName] = useState<string>(name);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isRequired, setIsRequired] = useState<boolean>(false);
    const [defaultInput, setDefaultInput] = useState<string>(unique_key);
    const [defaultValue, setDefaultValue] = useState<string>("");

    const toggleEditing = () => {
        if(!isEditing) {
            setIsEditing(true);
            return;
        } 
        else {
            setIsEditing(false);
            return;
        }
    };

    return (
        <>
            {isEditing ? 
                (<div className=" outline outline-slate-200/70 rounded-md p-2 w-full">
                    <div className=" flex flex-row">
                        <input 
                            className=" mr-auto text-gray-400 bg-dark-100 focus:ring-0 font-mono text-sm leading-none shadow-none outline-none border-none p-1.5 rounded-sm"
                            type="input" 
                            value={inputName} 
                            onChange={(evt) => setInputName(evt.target.value)} />
                        <Button buttonIcon="tick" size="small" style="minimal" outline={false} onAction={() => toggleEditing()}/>
                        <Button buttonIcon="trash" size="small" style="minimal" outline={false}/>
                    </div>
                    <div className=" flex flex-row items-center pt-3">
                        <p className=" mr-auto leading-none">Required Input?</p>
                        <input 
                            className=" text-primary-400/80 bg-dark-100 h-5 w-5 rounded-sm shadow-none border-none focus:border-none focus:ring-0"
                            checked={isRequired}
                            onChange={() => setIsRequired(!isRequired)}
                            type="checkbox" />
                    </div>
                    <div className=" flex flex-row items-start pt-3 ">
                        <p className=" mr-auto leading-none">Key</p>
                        <input
                            className=" text-gray-400 bg-dark-100 focus:ring-0 font-mono text-sm leading-none shadow-none outline-none border-none p-1.5 rounded-sm"
                            type="text" 
                            spellCheck={false}
                            onChange={(evt) => setDefaultInput(evt.target.value)}
                            value={defaultInput} />
                    </div>
                    <div className=" flex flex-row items-start pt-3 pb-1 ">
                        <p className={` mr-auto leading-none ${isRequired ? " text-gray-200/80" : "" } `}>Default</p>
                        <input
                            disabled={isRequired}
                            className=" text-gray-400 disabled:text-gray-200/70 bg-dark-100 disabled:bg-dark-100/40 focus:ring-0 font-mono text-sm leading-none shadow-none outline-none border-none p-1.5 rounded-sm"
                            type="text" 
                            spellCheck={false} 
                            onChange={(evt) => setDefaultValue(evt.target.value)}
                            value={defaultValue} />
                    </div>
                </div>) :
                (<div className=" outline outline-slate-200/70 rounded-md px-2 py-1 w-full">
                    <div className=" flex flex-row">
                        <p className=" font-semibold mr-auto">{inputName}</p>
                        <Button buttonIcon="edit" size="small" style="minimal" outline={false} onAction={() => toggleEditing()}/>
                        <Button buttonIcon="trash" size="small" style="minimal" outline={false}/>
                    </div>
                    <div className=" flex flex-row items-center gap-1">
                        <div className=" flex flex-row gap-1 items-center">
                            <Icon icon="shield" size={12} color={"#DCE0E5"}/>
                            <p className="text-sm leading-none">{isRequired ? "Required" : "Optional"}</p>
                        </div>
                        <span className=" text-slate-200">&#183;</span>
                        <div className=" flex flex-row gap-1 items-center">
                            <Icon icon="key" size={12} color={"#DCE0E5"}/>
                            <p className="text-sm leading-none">{defaultInput}</p>
                        </div>
                    </div>
                </div>)
            }
        </>
    )
}

function TaskSidebar() {
    return (
        <>
            <Card className="mb-2">
                <div className="flex flex-row gap-2 items-center pb-2">
                    <div className=" mr-auto ">
                        <p className=" font-semibold text-lg leading-none">Inputs</p>
                    </div>
                    <Button buttonIcon="plus" size="medium" style="minimal" color="primary" outline={false}/>
                </div>
                <div className=" flex flex-col gap-4 ">
                    <TaskSidebarInputs name={"Job Title"} unique_key={"job-title"}/>
                    <TaskSidebarInputs name={"Job Responsibilities"} unique_key={"responsibilities"}/>
                </div>
            </Card>
            <Card className="mb-2">
                <p className=" font-semibold text-lg pb-2">Model</p>
                <div className=" flex flex-col outline p-2 outline-gray-400/60 rounded-sm">
                    <div className=" flex flex-row gap-2 items-center">
                        <Icon icon="application" size={16} color={"#DCE0E5"}/>
                        <p className="font-mono text-sm leading-normal hover:cursor-pointer hover:underline underline-offset-4">The Model Name 7B</p>
                    </div>
                </div>
            </Card>
        </>
    )
}

function TaskPage({ task }: { task: string }) {
    return (
        <TwoColumnLayout type="right">
            <Column>
                <TaskSidebar />
            </Column>
            <Column>
                <TaskInstructions />
                <TaskValidation />
            </Column>
        </TwoColumnLayout>
    );
} 

export default function Task() {
    const { taskid } = useParams<"taskid">();

    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const task = taskid!;

    return (
        <Page header={<TaskHeader task={task} />}>
            <TaskStatus />
            <TaskPage task={task} />
        </Page>
    );
}

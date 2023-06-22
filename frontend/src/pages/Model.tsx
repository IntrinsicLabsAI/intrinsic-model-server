import { Icon } from "@blueprintjs/core";
import Dropdown from "../components/core/Dropdown";
import { useParams } from "react-router-dom";
import EditableCode from "../components/EditableCode";
import Widget from "../components/core/Widget";
import InferenceRunner from "../components/InferenceRunner";
import { useGetDescriptionQuery, useUpdateDescriptionMutation } from "../api/services/v1";

import Page from "../components/layout/Page";
import OneColumnLayout from "../components/layout/OneColumnLayout";
import TwoColumnLayout from "../components/layout/TwoColumnLayout";
import Column from "../components/layout/Column";
import Pill from "../components/core/Pill";

export default function Model() {
    const { name } = useParams<"name">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const modelName = name!;

    const { data: description } = useGetDescriptionQuery(modelName);
    const [updateDescriptionAction] = useUpdateDescriptionMutation();
    const markdown = `# ${modelName}`;

    return (
        <Page>
            <OneColumnLayout>
                <Column>
                    <div className="flex flex-row h-full gap-4 bg-dark-200 p-4 justify-items-start rounded">
                        <div className="w-8 h-8 bg-purple-600 rounded-sm">
                            <div className="flex flex-col h-full items-center justify-center">
                                <Icon icon="lengthen-text" size={20} color="#252A31" />
                            </div>
                        </div>
                        <h1 className=" leading-none text-3xl font-semibold">{modelName}</h1>
                        <div className="ml-auto">
                            <Dropdown
                                buttonText="Actions"
                                items={[
                                    { id: "delete", value: "Delete Model" },
                                    { id: "new-version", value: "New Version" },
                                ]}
                            />
                        </div>
                    </div>

                </Column>
            </OneColumnLayout>
            <TwoColumnLayout type="left">
                <Column>
                    <EditableCode
                        initialCode={markdown}
                        code={description}
                        langage="markdown"
                        setCode={
                            (desc) => {
                                updateDescriptionAction({
                                    modelName,
                                    description: desc,
                                });
                            }
                        }
                    />
                    <InferenceRunner model={modelName} />
                </Column>
                <Column>
                    <Widget title="About">
                        <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
                            <div className="flex flex-row items-center gap-4 pb-4" >
                                <p className=" w-1/3 font-semibol ">Model Type</p>
                                <Pill text="Completion"></Pill>
                            </div>
                            <div className="flex flex-row items-center gap-4 pb-4" >
                                <p className=" w-1/3 font-semibold">Source</p>
                                <Pill text="HuggingFace"></Pill>
                            </div>
                            <div className="flex flex-row items-center gap-4 pb-4" >
                                <p className=" w-1/3 font-semibold">Lineage</p>
                                <Pill text="User Upload"></Pill>
                            </div>
                            <div className="flex flex-row items-center gap-4 pb-4" >
                                <p className=" w-1/3 font-semibold">Format</p>
                                <Pill text="GGML"></Pill>
                            </div>
                            <div className="flex flex-row items-center gap-4 pb-4" >
                                <p className=" w-1/3 font-semibold">Context Size</p>
                                <Pill text="4,250 Tokens"></Pill>
                            </div>
                        </div>
                    </Widget>
                    <Widget title="History">
                        <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
                            <p>Version history for the model</p>
                        </div>
                    </Widget>
                </Column>
            </TwoColumnLayout>
        </Page>
    )
}
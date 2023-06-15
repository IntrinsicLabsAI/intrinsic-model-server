import { Icon } from "@blueprintjs/core";
import Dropdown from "../components/core/Dropdown";
import { useParams } from "react-router-dom";
import EditableCode from "../components/core/EditableCode";
import Widget from "../components/core/Widget";
import InferenceRunner from "../components/InferenceRunner";
import { useGetDescriptionQuery, useUpdateDescriptionMutation } from "../api/services/baseService";

import Page from "../components/layout/Page";
import OneColumnLayout from "../components/layout/OneColumnLayout";
import TwoColumnLayout from "../components/layout/TwoColumnLayout";
import Column from "../components/layout/Column";

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
                        <div className="w-8 h-8 bg-primary-100 rounded-sm">
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
                    <Widget title="Details">
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
                    </Widget>
                    <InferenceRunner model={modelName} />
                </Column>
                <Column>
                    <Widget title="About">
                        <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
                            <ul>
                                <p className="text-sm">0.3.0</p>
                                <p className="text-sm">0.2.0</p>
                                <p className="text-sm">0.1.0</p>
                                <p className="text-sm">0.0.1</p>
                            </ul>
                        </div>
                    </Widget>
                </Column>
            </TwoColumnLayout>
        </Page>
    )
}
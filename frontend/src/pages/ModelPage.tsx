import { Icon } from "@blueprintjs/core";
import Dropdown from "../components/core/Dropdown";
import Page from "../components/core/Page";
import { useParams } from "react-router-dom";
import EditableCode from "../components/core/EditableCode";
import Widget from "../components/core/Widget";
import InferenceRunner from "../components/InferenceRunner";
import { useGetDescriptionQuery, useUpdateDescriptionMutation } from "../api/services/baseService";


export default function ModelPage() {
    const { name } = useParams<"name">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const modelName = name!;

    const { data: description } = useGetDescriptionQuery(modelName);
    const [updateDescriptionAction] = useUpdateDescriptionMutation();

    const markdown =
        `# ${modelName}

\`\`\`javascript
function() {
  // Example of dispatching requests via fetch() API
  const result = await fetch("https://localhost:8000/v1/vicuna-7b/0.1.0/complete");
}
\`\`\`

## Have a loading indicator that can show how things are going...`;

    return (
        <Page
            header={
                <>
                    <div className="w-14 h-14 bg-primary-100 rounded-sm">
                        <div className="flex flex-col h-full items-center justify-center">
                            <Icon icon="graph" size={32} color="#252A31" />
                        </div>
                    </div>
                    <div>
                        <h3 className=" text-gray-200 leading-none">Completion</h3>
                        <h1 className=" text-3xl">{modelName}</h1>
                    </div>
                    <div className="ml-auto">
                        <Dropdown
                            buttonText="Actions"
                            items={[
                                { id: "delete", value: "Delete Model" },
                                { id: "new-version", value: "New Version" },
                            ]}
                        />
                    </div>
                </>
            }

            content={
                <>
                    <div className="pb-5">
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
                    </div>
                    <InferenceRunner model={modelName} />
                </>
            }

            sidebar={
                <>
                    <div className="pb-5">
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
                    </div>
                    <Widget title="Versions">
                        <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
                            <ul>
                                <p className="text-sm">0.3.0</p>
                                <p className="text-sm">0.2.0</p>
                                <p className="text-sm">0.1.0</p>
                                <p className="text-sm">0.0.1</p>
                            </ul>
                        </div>
                    </Widget>
                </>
            }
        />
    );
}
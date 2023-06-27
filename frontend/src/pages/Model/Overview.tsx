import { useMemo } from "react";
import { useGetDescriptionQuery, useGetModelsQuery, useUpdateDescriptionMutation, isHuggingFaceSource } from "../../api/services/v1";

import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated-icons/16px/blueprint-icons-16.ts"
import Pill from "../../components/core/Pill";
import { useParams } from "react-router-dom";
import EditableCode from "../../components/EditableCode";
import Widget from "../../components/core/Widget";

import TwoColumnLayout from "../../components/layout/TwoColumnLayout";
import Column from "../../components/layout/Column";
import Timeline from "../../components/core/Timeline";

export default function Overview() {
    const { name } = useParams<"name">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const modelName = name!;

    const { registeredModel } = useGetModelsQuery(undefined, {
        selectFromResult: ({ data }) => ({ registeredModel: data?.models.find(m => m.name === modelName) })
    })

    const source = useMemo(() => {
        if (registeredModel === undefined) {
            return undefined;
        }

        const latest = registeredModel.versions[registeredModel.versions.length - 1];
        const importSource = latest.import_metadata.source
        if (isHuggingFaceSource(importSource)) {
            return {
                link: `https://huggingface.co/${importSource.source.repo}/blob/main/${importSource.source.file}`,
                popover: importSource.source.repo,
                importTime: latest.import_metadata.imported_at,
                sourceDisplayName: "HuggingFace",
            }
        } else {
            return {
                link: undefined,
                popover: importSource.source.path,
                importTime: latest.import_metadata.imported_at,
                sourceDisplayName: "File Upload",
            }
        }
    }, [registeredModel]);

    const { data: description } = useGetDescriptionQuery(modelName);
    const [updateDescriptionAction] = useUpdateDescriptionMutation();
    const markdown = `# ${modelName}`;

    const timelineEvents = [
        {
            id: "1",
            name: "Initial Model Created",
            description: "This was the initial release of your model.",
            icon: "tag" as BlueprintIcons_16Id,
            highlight: "v0.1.0"
        }, {
            id: "2",
            name: "Model Created",
            description: "New version of the model which was deployed.",
            icon: "tag" as BlueprintIcons_16Id,
            highlight: "v0.2.0"
        }];

    return (
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

            </Column>
            <Column>
                <Widget title="About">{
                    registeredModel &&
                    (<div className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
                        <div className="flex flex-row items-center gap-4 pb-4" >
                            <p className=" w-1/3 font-semibol ">Model Type</p>
                            <Pill text={registeredModel.model_type}></Pill>
                        </div>
                        <div className="flex flex-row items-center gap-4 pb-4" >
                            <p className=" w-1/3 font-semibold">Source</p>
                            <a href={source?.link ?? "about:blank"} target="_blank">
                                <Pill text={source?.sourceDisplayName ?? ""}></Pill>
                            </a>
                        </div>
                        <div className="flex flex-row items-center gap-4 pb-4" >
                            <p className=" w-1/3 font-semibold">Lineage</p>
                            <Pill text="LLaMa"></Pill>
                        </div>
                        <div className="flex flex-row items-center gap-4 pb-4" >
                            <p className=" w-1/3 font-semibold">Format</p>
                            <Pill text={registeredModel.runtime}></Pill>
                        </div>
                    </div>)
                }
                </Widget>
                <Widget title="History">
                    <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
                        <Timeline events={timelineEvents}/>
                    </div>
                </Widget>
            </Column>
        </TwoColumnLayout>
    )
}
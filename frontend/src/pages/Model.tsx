import { useMemo, useState } from "react";
import { useGetDescriptionQuery, useGetModelsQuery, useUpdateDescriptionMutation, isHuggingFaceSource } from "../api/services/v1";

import Pill from "../components/core/Pill";
import InferenceExploration from "../components/InferenceExploration";
import { useParams } from "react-router-dom";
import EditableCode from "../components/EditableCode";
import Widget from "../components/core/Widget";

import Page from "../components/layout/Page";
import OneColumnLayout from "../components/layout/OneColumnLayout";
import TwoColumnLayout from "../components/layout/TwoColumnLayout";
import Column from "../components/layout/Column";

export default function Model() {
    const { name } = useParams<"name">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const modelName = name!;

    const [selectedTab, isSelectedTab] = useState("overview")

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

    return (
        <Page>
            <OneColumnLayout>
                <Column>
                    <div className=" bg-dark-200 p-4 rounded">
                        <div className="flex flex-row h-full gap-4 justify-items-start pb-5">
                            <h1 className=" leading-none text-3xl font-semibold">{modelName}</h1>
                        </div>
                        <div className="flex flex-row h-full gap-4 justify-items-start">
                            <div onClick={() => isSelectedTab("overview")}>
                                <h3 className={` cursor-pointer leading-none text-md font-semibold ${selectedTab == "overview" ? " text-primary-400" : " "}`}>Overview</h3>
                            </div>
                            <div onClick={() => isSelectedTab("experiments")}>
                                <h3 className={` cursor-pointer leading-none text-md font-semibold ${selectedTab == "experiments" ? " text-primary-400" : " "}`}>Experiments</h3>
                            </div>
                        </div>
                    </div>
                </Column>
            </OneColumnLayout>
            {selectedTab == "overview" && (
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
                                <p>Version history for the model</p>
                            </div>
                        </Widget>
                    </Column>
                </TwoColumnLayout>
            )}
            {selectedTab == "experiments" && (
                <OneColumnLayout>
                    <Column>
                        <InferenceExploration model={modelName} />
                    </Column>
                </OneColumnLayout>
            )}
        </Page>
    )
}
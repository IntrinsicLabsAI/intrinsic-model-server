import { useGetModelsQuery, useGetTasksQuery } from "../api/services/v1";
import { Link } from "react-router-dom";

import Callout from "../components/core/Callout";
import ModelCardView from "../components/ModelCardView";
import Page from "../components/layout/Page";
import OneColumnLayout from "../components/layout/OneColumnLayout";
import TwoColumnLayout from "../components/layout/TwoColumnLayout";
import Widget from "../components/core/Widget";
import Column from "../components/layout/Column";
import { featureUpdates } from "../data/featureUpdates";
import Card from "../components/core/Card";
import { Icon } from "@blueprintjs/core";
import { useNavigate } from "react-router";
import Button from "../components/core/Button";

export default function Home() {
    // All models
    const { data, isLoading } = useGetModelsQuery();
    const { data: taskData, isLoading: taskIsLoading } = useGetTasksQuery();

    const navigate = useNavigate();

    return (
        <>
            <Page>
                <OneColumnLayout>
                    <Column>
                        <Callout color="green">
                            <h3 className="text-lg font-semibold text-dark-500 leading-none">
                                Welcome to Intrinsic Model Server
                            </h3>
                            <p className="text-lg text-dark-500 leading-snug mt-2">
                                This project is under active development by members of{" "}
                                <a
                                    href="https://intrinsiclabs.ai"
                                    target="_blank"
                                    className="underline underline-offset-2"
                                >
                                    Intrinsic Labs
                                </a>
                                . If you have any issues or ideas, add them as issues to the{" "}
                                <a
                                    href="https://github.com/IntrinsicLabsAI/intrinsic-model-server"
                                    target="_blank"
                                    className="underline underline-offset-2"
                                >
                                    GitHub repository
                                </a>
                                . A roadmap for this project is available in the GitHub repository.
                            </p>
                        </Callout>
                    </Column>
                </OneColumnLayout>

                <TwoColumnLayout type="left">
                    <Column>
                        {(data?.models.length ?? 0) > 0 ? (
                            <Widget title="Registered Models">
                                <div className="flex flex-col h-full">
                                    <div className="flex flex-row items-center w-full">
                                        <p className=" text-lg font-base leading-tight text-gray-200">
                                            The models listed below are currently active and
                                            available for use with Intrinsic Server. Different
                                            versions of each model can be used by indicating the
                                            version when invoking the model. You can register new
                                            models using this App or via API.
                                        </p>
                                    </div>
                                    <div className="flex flex-row items-center w-full mt-4">
                                        <h3 className=" text-xl font-semibold">
                                            Completion Models
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                                        {!isLoading && data
                                            ? data.models.map((model) => (
                                                  <div key={model.name} className=" w-full ">
                                                      <ModelCardView modelName={model.name} />
                                                  </div>
                                              ))
                                            : null}
                                    </div>
                                </div>
                            </Widget>
                        ) : (
                            <Card>
                                <h2 className=" text-xl font-semibold pb-2 ">
                                    Getting Started with Intrinsic Server
                                </h2>
                                <p className=" leading-snug">
                                    Import a model to start using Intrinsic Server. You can import
                                    from a{" "}
                                    <a
                                        href="https://huggingface.co/"
                                        className="text-cyan-400/70 font-semibold hover:underline hover:underline-offset-4"
                                    >
                                        HuggingFace
                                    </a>{" "}
                                    repository or upload a model from disk. Questions?{" "}
                                    <a
                                        href="https://intrinsiclabsai.github.io/intrinsic-model-server"
                                        className="text-cyan-400/70 font-semibold hover:underline hover:underline-offset-4"
                                    >
                                        Check out the documentation
                                    </a>
                                    .
                                </p>
                                <div className="mt-4 w-fit mx-auto">
                                    <Button
                                        color="primary"
                                        size="large"
                                        style="bold"
                                        buttonIcon="cloud-upload"
                                        buttonText="Import a model"
                                        onAction={() => {
                                            navigate("/new-model");
                                        }}
                                    />
                                </div>
                            </Card>
                        )}
                        <Widget title="Tasks">
                            <div className="grid grid-cols-2 gap-4 my-2">
                                {!taskIsLoading && taskData
                                    ? taskData.map((task) => (
                                          <Link key={task.task_id} to={`/task/${task.name}`}>
                                              <div className="flex flex-row gap-4 outline outline-gray-200 hover:outline-blue-600 rounded-sm px-4 py-2 cursor-pointer items-center">
                                                  <p className=" flex-grow font-semibold text-dark-600 text-sm lg:text-xl leading-none truncate">
                                                      {task.name}
                                                  </p>
                                                  <Icon
                                                      icon="arrow-right"
                                                      size={24}
                                                      color="#DCE0E5"
                                                  />
                                              </div>
                                          </Link>
                                      ))
                                    : null}
                            </div>
                        </Widget>
                    </Column>

                    <Column>
                        <Widget title="Feature Updates">
                            <div>
                                {featureUpdates
                                    .sort((a, b) => b.id - a.id)
                                    .map((update) => (
                                        <div className=" pb-2 " key={update.id}>
                                            <Card>
                                                <div className="flex flex-col w-full gap-1">
                                                    <h3 className=" text-lg font-medium ">
                                                        {update.title}
                                                    </h3>
                                                    <div className="flex flex-row gap-1.5 items-center">
                                                        <Icon
                                                            icon="time"
                                                            size={14}
                                                            color="#82BEC7"
                                                        />
                                                        <p className=" text-sm font-medium leading-none text-blue-500">
                                                            {update.date.toDateString()}
                                                        </p>
                                                    </div>
                                                    <p className=" pt-2 whitespace-pre-wrap ">
                                                        {update.description}
                                                    </p>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                            </div>
                        </Widget>
                    </Column>
                </TwoColumnLayout>
            </Page>
        </>
    );
}

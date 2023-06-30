import { useGetImportStatusQuery } from "../api/services/v1";
import { Link, useParams } from "react-router-dom";
import Page from "../components/layout/Page";
import OneColumnLayout from "../components/layout/OneColumnLayout";
import Column from "../components/layout/Column";
import Callout from "../components/core/Callout";
import Button from "../components/core/Button";
import Card from "../components/core/Card";
import { useNavigate } from "react-router-dom";
import { Icon } from "@blueprintjs/core";

function ProgressBar({
    status,
    progress,
}: {
    status: "in-progress" | "failed" | "finished" | undefined,
    progress?: number,
}) {
    return (
        <div className=" mt-4">
            <div className="h-1 w-full bg-gray-200/40">
                {status === "in-progress" && (
                    <div className="h-1 bg-purple-400 animate-pulse" style={{ width: `${progress}%` }} />
                )}
                {status === "failed" && (
                    <div className="h-1 bg-red-500 animate-pulse" style={{ width: `100%` }} />
                )}
                {status === "finished" && (
                    <div className="h-1 bg-primary-500 animate-pulse" style={{ width: `100%` }} />
                )}
            </div>
        </div>
    );
}

export default function ImportModel() {
    const { importid } = useParams<"importid">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const importJob = importid!;

    const navigate = useNavigate()
    const { data } = useGetImportStatusQuery(importJob, { pollingInterval: 3_000 })

    return (
        <Page>
            <OneColumnLayout type="narrow">
                <Column>
                    <div className="flex flex-row gap-2 w-full items-top">
                        <div className="flex flex-col mr-auto">
                            <h1 className=" font-semibold text-2xl leading-none pb-1">Importing Model from HuggingFace</h1>
                            <h3 className=" text-gray-400/60 pb-3">Import Job: {importJob}</h3>
                        </div>
                        <Button
                            onAction={() => navigate("/")}
                            buttonText="View Model"
                            type="text"
                            disabled={data?.type === "finished" ? false : true} />
                    </div>
                    <>
                        {data?.type === "in-progress" && (
                            <Callout color="purple" icon="time">
                                <h3 className=" text-dark-200 font-semibold leading-none text-lg pb-2">Please wait while your model is being imported</h3>
                                <p className=" text-dark-200 leading-snug ">
                                    This process typically take 5-10 minutes depending on the server's internet connection.
                                    As part of importing, the server will validate the compatibility of the model with the server's runtime.
                                </p>
                            </Callout>
                        )}
                        {data?.type === "failed" && (
                            <Callout color="red" icon="cross">
                                <h3 className=" text-dark-200 font-semibold leading-none text-lg pb-2">Your model failed to import</h3>
                                <p className=" text-dark-200 leading-snug ">
                                    The server was unable to import the model. Please check the logs for more information.
                                    Generally, this is caused by the model being incompatible with the server's runtime.
                                </p>
                            </Callout>
                        )}
                        {data?.type === "finished" && (
                            <Callout color="green" icon="tick">
                                <h3 className=" text-dark-200 font-semibold leading-none text-lg pb-2">Your model was successfully imported</h3>
                                <p className=" text-dark-200 leading-snug ">
                                    The server was able to import and validate the model.
                                    This model is now available for use in the server.
                                    Please check the logs for more information.

                                </p>
                            </Callout>
                        )}
                    </>
                    <Card className=" mt-4 ">
                        <div className=" flex flex-col w-full ">
                            <h3 className=" font-semibold text-lg">Progress</h3>
                            <ProgressBar progress={10} status={data?.type} />
                            {data?.type === "in-progress" && (
                                <>
                                    <p className="font-semibold animate-none mt-2">The model is being downloaded from HuggingFace Hub</p>
                                    <p className="animate-none pt-2 leading-tight">
                                        This will continue in the background if you navigate away from this page.
                                        You may not be notified of errors if you navigate away without looking at the logs.
                                    </p>
                                </>
                            )}
                            {data?.type === "failed" && (
                                <>
                                    <p className="font-semibold animate-none mt-2">The model import has failed</p>
                                    <p className="pt-2 leading-tight">
                                        The server could not process this model and returned the following error.
                                        Please review the error, the model, and the server logs to determine the cause.
                                    </p>
                                    <p className=" font-mono pt-2 text-sm font-semibold text-center ">Error: {data?.error}</p>
                                </>
                            )}
                            {data && data.type === "finished" && (
                                <>
                                    <p className="font-semibold animate-none mt-2">The model import has completed</p>
                                    <p className="animate-none pt-2 leading-tight">
                                        Your model is now available to use and available via API to all users of the server.
                                    </p>

                                    <p className=" font-mono pt-2 text-sm font-semibold text-center flex flex-row ">
                                        {data?.info}
                                        {
                                            Object.prototype.hasOwnProperty.call(data.metadata, "model_name")
                                            && (
                                                <span className="ml-2">

                                                    <Link to={`/model/${data.metadata!["model_name"]}`}> {/* eslint-disable-line @typescript-eslint/no-non-null-assertion */}
                                                        <Icon icon="document-open" size={18} color={"#53b79a"} />
                                                    </Link>
                                                </span>
                                            )
                                        }
                                    </p>
                                </>
                            )}
                        </div>
                    </Card>
                </Column>
            </OneColumnLayout>
        </Page >
    )
}
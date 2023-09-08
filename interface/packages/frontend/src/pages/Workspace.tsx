import { Outlet, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DropdownMenu from "../components/core/DropdownMenu";
import Button from "../components/core/Button";
import { Status, StatusChecker } from "../api/services/statusService";
import { baseURL } from "../utils/prod";
import { useCreateTaskMutation } from "../api/services/v1";
import { DateTime } from "luxon";

// import { Test } from "intrinsic-ui";

export default function Workspace() {
    // Setup status checker in background.
    const [onlineState, setOnlineState] = useState<Status>("loading");

    // Redux Mutations
    const [createTaskAction] = useCreateTaskMutation();

    useEffect(() => {
        // Create and mount a status checker on the beginning of page load.
        const checker = new StatusChecker(setOnlineState);
        checker.start();
        return () => {
            checker.stop();
        };
    }, []);

    const navigate = useNavigate();

    const actionsButton = (key: string) => {
        if (key === "new-model") {
            navigate(key);
        } else if (key === "new-task") {
            const name =
                "new-task_" +
                DateTime.now().year +
                "-" +
                DateTime.now().month +
                "-" +
                DateTime.now().day +
                "_" +
                DateTime.now().hour +
                DateTime.now().minute;
            createTaskAction({ name: name });
            navigate("/task/" + name);
        }
    };

    return (
        <div className=" bg-base-100 ">
            <header className=" sticky top-0 z-50">
                <div className="flex flex-row h-16 p-4 items-center bg-base-200">
                    <Link to="/">
                        <p className=" text-base-content text-lg font-semibold">Intrinsic Server</p>
                    </Link>
                    <div className="ml-auto">
                        <Button
                            outline={false}
                            buttonIcon="manual"
                            size="large"
                            onAction={() => window.open(`${baseURL()}/docs`, "_blank")}
                        />
                    </div>
                    {/* <Test /> */}
                    <DropdownMenu
                        type="icon"
                        buttonIcon="cube-add"
                        onSelectionChange={actionsButton}
                        items={[
                            { id: "new-model", value: "Add a Model" },
                            { id: "new-task", value: "Create a Task" },
                        ]}
                    />
                    <div className="pl-3">
                        <div className="flex flex-col items-center outline outline-base-content rounded px-2 py-1">
                            {onlineState === "online" && (
                                <div className="flex flex-row items-center gap-2">
                                    <div className="w-3 h-3 bg-success rounded-full" />
                                    <p className=" text-sm font-semibold text-success">Online</p>
                                </div>
                            )}

                            {onlineState !== "online" && (
                                <div className="flex flex-row items-center gap-2">
                                    <div className="w-3 h-3 bg-error rounded-full" />
                                    <p className=" text-sm font-semibold text-error">Offline</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <main className=" isolate h-[calc(100vh-4rem)] overflow-auto ">
                <Outlet />
            </main>
        </div>
    );
}

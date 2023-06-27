import { useState } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated-icons/16px/blueprint-icons-16.ts"
import Page from "../components/layout/Page";
import { Icon } from "@blueprintjs/core";

function ModelHeader() {
    const { name } = useParams<"name">();
    const navigate = useNavigate();
    const [ currentTab, setCurrentTab ] = useState("overview");

    const tabClick = (tabId: string, tabRoute: string) => {
        if(currentTab !== tabId) {
            setCurrentTab(tabId)
            navigate(tabRoute)
        }
    }

    const tabs = [
        {
            id: "overview",
            display: "Overview",
            icon: "git-repo",
            route: `/model/${name}`
        },
        {
            id: "experiments",
            display: "Experiments",
            icon: "lab-test",
            route: `/model/${name}/experiments`
        }
    ]

    return (
        <div className=" flex flex-col justify-between">

            <h2 className=" font-semibold text-xl ">{name}</h2>
            <div className="flex flex-row pt-6 gap-4">
                {tabs.map(tab => (
                    <div key={tab.id} onClick={() => tabClick(tab.id, tab.route)} className={` ${currentTab === tab.id ? "border-b-2 border-primary-600" : ""} flex flex-row gap-2 cursor-pointer pb-2 pr-1`}>
                        <div className=" ">
                            <Icon icon={tab.icon as BlueprintIcons_16Id} size={16} color={"#E5E8EB"} />
                        </div>
                        <p className=" font-semibold leading-none">{tab.display}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function Model() {
    return (
        <Page header={<ModelHeader />}>
            <Outlet />
        </Page>
    )
}
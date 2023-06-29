import { useState } from "react";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated/16px/blueprint-icons-16.ts"
import Page from "../components/layout/Page";
import { Icon } from "@blueprintjs/core";
import DropdownMenu from "../components/core/DropdownMenu";
import ChangeNameModal from "./Model/ChangeNameModal";

function ModelHeader() {
    const { name } = useParams<"name">();
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const modelName = name!;

    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState(useLocation().pathname);
    const [isOpen, setIsOpen] = useState(false);

    const tabClick = (tabRoute: string) => {
        if (currentTab !== tabRoute) {
            setCurrentTab(tabRoute)
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

    const options = [
        {
            id: "editModelName",
            value: "Rename this model"
        }
    ]

    const menuOptions = (key: string) => {
        if(key === "editModelName") { setIsOpen(true) }
    }

    return (
        <>
            <ChangeNameModal isOpen={isOpen} setIsOpen={setIsOpen} modelName={modelName} />
            <div className=" flex flex-col justify-between">
                <div className="flex flex-row items-center">
                    <h2 className=" font-semibold text-xl mr-auto">{name}</h2>
                    <DropdownMenu
                        type='text'
                        buttonText="Actions"
                        items={options}
                        onSelectionChange={menuOptions} />
                </div>
                <div className="flex flex-row pt-10 gap-4">
                    {tabs.map(tab => (
                        <div key={tab.id} onClick={() => tabClick(tab.route)} className={` ${currentTab === tab.route ? "border-b-2 border-primary-600" : ""} flex flex-row gap-2 cursor-pointer pb-2 pr-1`}>
                            <div className=" ">
                                <Icon icon={tab.icon as BlueprintIcons_16Id} size={16} color={"#E5E8EB"} />
                            </div>
                            <p className=" font-semibold leading-none">{tab.display}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default function Model() {
    return (
        <Page header={<ModelHeader />}>
            <Outlet />
        </Page>
    )
}
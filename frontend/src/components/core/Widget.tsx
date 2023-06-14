import { Icon } from "@blueprintjs/core"
import React from "react";
import {BlueprintIcons_16Id} from "@blueprintjs/icons/src/generated-icons/16px/blueprint-icons-16.ts"

export default function Widget(
    {
        children,
        title,
        icon,
    } : {
        children?: React.ReactNode | React.ReactNode[],
        title: string,
        icon?: BlueprintIcons_16Id,
    }
){
    return (
        <div className="flex flex-col w-full outline outline-2 outline-dark-400 rounded-md divide-dark-400 divide-y-2 mb-5">
            <div className="flex flex-row w-full items-center p-2 gap-2 bg-dark-200">
                {(icon ? (
                    <div className="">
                        <Icon icon={icon} size={16} color="#F6F7F9" />
                    </div>
                ) : (
                    <React.Fragment />
                ))}
                <div>
                    <p className=" font-semibold ">{title}</p>
                </div>
            </div>
            <div className="p-2">
                {children}
            </div>
        </div>
    )
}
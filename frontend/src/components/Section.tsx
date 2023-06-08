import React from "react";
import { BookmarkSquareIcon } from "@heroicons/react/24/outline";

type HeroIcon = (props: React.ComponentProps<"svg">) => JSX.Element;

interface Props {
    children: React.ReactNode | React.ReactNode[];
    showIcon?: boolean; // Default false
    icon?: HeroIcon; // Default BookmarkSquareIcon
    showTitleBar?: boolean; // Default False
    title?: string; // Default Placeholder
    usePadding?: boolean; // Default False
    enableScrolling?: boolean; // Default TRUE
    useOutline?: boolean;
}

function Section(props: Props) {
    const defaultProps = { useOutline: true, enableScrolling: true, usePadding: false, showIcon: false, icon: BookmarkSquareIcon, showTitleBar: false, title: "Default Title..." }
    
    let propsFinal = { ...defaultProps, ...props }

    if (!propsFinal.icon) return null;

    return (
        <div className={`container h-full ${propsFinal.useOutline ? "outline outline-1 outline-dark-gray" : "" }`}>
            <div className="flex flex-col h-full">
                {propsFinal.showTitleBar &&
                    <div className="flex flex-row bg-dark-gray sticky top-0 px-4 py-2">
                    {propsFinal.showIcon && <propsFinal.icon className="h-6 w-6 stroke-2 mr-2 self-center text-white" />}
                    <p className="grow font-primary font-medium text-xl text-white ">{propsFinal.title}</p>
                    </div>
                }
                <div className={`flow h-full overflow-hidden
                                    ${propsFinal.usePadding ? "px-4 py-2" : ""}
                                    ${propsFinal.enableScrolling ? "overscroll-none overflow-y-auto" : ""}`}>
                    {propsFinal.children}
                </div>
            </div>
        </div>
    )
}

export default Section;
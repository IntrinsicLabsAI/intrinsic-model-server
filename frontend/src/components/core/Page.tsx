import React from "react";
import { ReactNode } from "react"

export default function Page(
    {
        header,
        sidebar,
        content,
    }: {
        content: ReactNode | React.ReactNode[],
        header?: ReactNode,
        sidebar?: ReactNode | React.ReactNode[],
    }
) {
    return (
        <div className="flex flex-col gap-5 pt-10 h-full w-full lg:w-8/12 mx-auto">
            <div className="flex flex-col outline outline-2 outline-dark-400 rounded">
                <div className="flex flex-row h-full gap-4 bg-dark-200 p-4">
                    {header != null ? header : <React.Fragment />}
                </div>
            </div>

            <div className="flex gap-5">
                <div className="w-3/4 shrink-0">
                    {content}
                </div>
                {
                    sidebar &&
                    (
                        <div className="w-1/4">
                            <div className="w-full h-full">
                                {sidebar}
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

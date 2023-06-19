import { ReactNode } from 'react'

export default function OneColumnLayout(
    {
        children,
        type
    }: {
        children: ReactNode,
        type?: "normal" | "narrow"
    }
) {
    return (
        <div className={`flex flex-row gap-5 pb-5 ${(type && type == "narrow") ? "w-6/7 lg:w-1/2 mx-auto" : "w-full"}`}>
            <div className="w-full">
                {children}
            </div>
        </div>
    )
}

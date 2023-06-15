import { ReactNode } from 'react'

export default function OneColumnLayout(
    {
        children,
    }: {
        children?: ReactNode
    }
) {
    if (children) {
        return (
            <div className="flex flex-row w-full gap-5 pb-5">
                <div className="w-full">
                    {children}
                </div>
            </div>
        )
    } else {
        console.error("OneColumnLayour requires exactly one child element.")
        return (<></>)
    }
}
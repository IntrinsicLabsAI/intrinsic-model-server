import { ReactNode } from 'react'

export default function OneColumnLayout(
    {
        children,
    }: {
        children: ReactNode
    }
) {
    return (
        <div className="flex flex-row w-full gap-5 pb-5">
            <div className="w-full">
                {children}
            </div>
        </div>
    )
}

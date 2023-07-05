import { ReactNode } from 'react'

export default function TwoColumnLayout(
    {
        children,
        type
    }: {
        children: [ReactNode, ReactNode],
        type: "left" | "right" | "equal" | "rightWide" | "leftWide"
    }
) {
    const typeOptions = {
        left: ["w-2/3", "w-1/3"],
        leftWide: ["w-5/6", "w-1/6"],
        right: ["w-1/3", "w-2/3"],
        rightWide: ["w-1/6", "w-5/6"],
        equal: ["w-1/2", "w-1/2"]
    }

    const [child1, child2] = children;

    return (
        <div className='flex flex-row w-full gap-5 pb-5'>
            <div className={`${typeOptions[type][0]}`}>
                {child1}
            </div>

            <div className={`${typeOptions[type][1]}`}>
                {child2}
            </div>
        </div>
    )
}
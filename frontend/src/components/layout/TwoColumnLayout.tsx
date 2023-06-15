import { ReactNode } from 'react'

export default function TwoColumnLayout(
    {
        children,
        type
    }: {
        children?: ReactNode[],
        type: "left" | "right" | "equal"
    }
) {
    const typeOptions = {
        left: ["w-2/3", "w-1/3"],
        right: ["w-1/3", "w-2/3"],
        equal: ["w-1/2", "w-1/2"]
    }

    if (children && children.length == 2) {
        return (
            <div className='flex flex-row w-full gap-5 pb-5'>
                <div className={`${typeOptions[type][0]}`}>
                    {children[0]}
                </div>

                <div className={`${typeOptions[type][1]}`}>
                    {children[1]}
                </div>
            </div>
        )
    } else {
        console.error("TwoColumnLayout requires exactly two children elements.")
        return (<></>)
    }
}
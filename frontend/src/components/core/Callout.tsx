import { SparklesIcon } from "@heroicons/react/24/outline";

export default function Callout({
    children,
    color
} : {
    children?: React.ReactNode | React.ReactNode[],
    color: string
}) {
    const iconColor = `text-${color}-600`;
    const borderColor = `outline-${color}-600`;
    const backgroundColor = `bg-${color}-300`;

    return (
        <div className={`flex flex-col w-full h-full ${backgroundColor} outline outline-1 ${borderColor} rounded-md p-6`}>
            <div className="flex flex-row gap-4 w-full h-full">
                <SparklesIcon className={`h-6 w-6 stroke-2 ${iconColor}`}/>
                <div className=" flex flex-col w-full h-full">
                    {children}
                </div>
            </div>
        </div>
    )
}
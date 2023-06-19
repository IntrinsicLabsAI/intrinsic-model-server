import { SparklesIcon } from "@heroicons/react/24/outline";

export default function Callout({
    children,
    color
} : {
    children?: React.ReactNode | React.ReactNode[],
    color?: "green" | "blue" | "purple"
}) {
    const colorOptions = {
        green: "bg-primary-300",
        blue: "bg-blue-600",
        purple: "bg-purple-600"
    }

    return (
        <div className={`flex flex-col w-full h-full rounded-md p-6 ${color ? colorOptions[color] : colorOptions["blue"]}`}>
            <div className="flex flex-row gap-4 w-full h-full">
                <SparklesIcon className="h-6 w-6 stroke-2 text-dark-500"/>
                <div className=" flex flex-col w-full h-full ">
                    {children}
                </div>
            </div>
        </div>
    )
}
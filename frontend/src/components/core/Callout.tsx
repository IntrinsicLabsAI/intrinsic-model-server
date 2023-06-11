import { SparklesIcon } from "@heroicons/react/24/outline";

export default function Callout({
    children,
    color
} : {
    children?: React.ReactNode | React.ReactNode[],
    color: "blue" | "red"
}) {
    const colorVariants = {
        blue: 'bg-blue-300 outline-blue-600',
        red: 'bg-red-300 outline-red-600',
    }

    const iconVariants = {
        blue: 'text-blue-600',
        red: 'text-red-300',
    }

    return (
        <div className={`${colorVariants[color]} flex flex-col w-full h-full outline outline-1 rounded-md p-6`}>
            <div className="flex flex-row gap-4 w-full h-full">
                <SparklesIcon className={`h-6 w-6 stroke-2 ${iconVariants[color]}`}/>
                <div className=" flex flex-col w-full h-full">
                    {children}
                </div>
            </div>
        </div>
    )
}
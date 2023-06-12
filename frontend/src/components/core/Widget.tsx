import { Icon } from "@blueprintjs/core"

export default function Widget(
    {
        children,
        title
    } : {
        children?: React.ReactNode | React.ReactNode[],
        title: string
    }
){
    return (
        <div className="flex flex-col w-full h-full outline outline-2 outline-dark-400 rounded-md divide-dark-400 divide-y-2">
            <div className="flex flex-row w-full items-center p-2 gap-2">
                <div className="">
                    <Icon icon="anchor" size={16} color="#F6F7F9" />
                </div>
                <div>
                    <p className=" font-semibold ">{title}</p>
                </div>
            </div>
            <div className="p-2">
                {children}
            </div>
        </div>
    )
}
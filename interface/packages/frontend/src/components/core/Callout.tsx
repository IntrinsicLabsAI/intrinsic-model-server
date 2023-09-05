import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated/16px/blueprint-icons-16";
import { Icon } from "@blueprintjs/core";

export default function Callout({
    children,
    color,
    icon,
}: {
    children?: React.ReactNode | React.ReactNode[];
    color?: "green" | "blue" | "purple" | "red";
    icon?: BlueprintIcons_16Id;
}) {
    const colorOptions = {
        green: "bg-primary-300",
        blue: "bg-blue-600",
        purple: "bg-purple-600",
        red: "bg-red-500",
    };

    return (
        <div
            className={`flex flex-col w-full rounded-md p-4 ${
                color ? colorOptions[color] : colorOptions["blue"]
            }`}
        >
            <div className="flex flex-row gap-4 w-full h-full items-start">
                {icon && (
                    <div className="">
                        <Icon icon={icon} size={20} color={"#252A31"} />
                    </div>
                )}
                <div className=" flex flex-col w-full h-full ">{children}</div>
            </div>
        </div>
    );
}

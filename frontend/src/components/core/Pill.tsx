import { Icon } from "@blueprintjs/core";
import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated/16px/blueprint-icons-16.ts";

export default function Pill({
    text,
    color,
    icon,
}: {
    text: string;
    color?: "blue" | "purple" | "primary";
    icon?: BlueprintIcons_16Id;
}) {
    const colors = {
        blue: "bg-blue-400",
        purple: "bg-purple-400",
        primary: "bg-primary-400",
    };

    return (
        <div
            className={`flex flex-row gap-1 items-center ${
                colors[color || "primary"]
            } px-2 py-1 rounded-3xl`}
        >
            {icon && <Icon icon={icon} size={14} color={"#252A31"} />}
            <p className=" text-dark-200 font-bold text-xs">{text}</p>
        </div>
    );
}

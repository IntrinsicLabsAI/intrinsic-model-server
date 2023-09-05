import { Icon } from "@blueprintjs/core";
import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated/16px/blueprint-icons-16";
import Pill from "./Pill";

interface metadata {
    icon?: BlueprintIcons_16Id;
    value: string;
}

export interface timelineEvent {
    id: number;
    name: string;
    description?: string;
    metadata?: metadata[];
    highlight?: string;
    icon?: BlueprintIcons_16Id;
}

export default function Timeline({ events }: { events: timelineEvent[] }) {
    return (
        <div>
            {events
                .sort((a, b) => a.id - b.id)
                .map((event) => (
                    <div key={event.id} className="flex flex-col w-full pb-4">
                        <div className="flex flex-row w-full gap-4 items-start">
                            <div className="outline outline-gray-400 rounded-full p-1.5 m-1">
                                <Icon
                                    icon={`${event.icon ? event.icon : "flag"}`}
                                    size={12}
                                    color="#F6F7F9"
                                />
                            </div>
                            <div className=" flex flex-col items-start gap-1 w-full">
                                <div className=" flex flex-row w-full gap-2">
                                    <h3 className=" font-semibold "> {event.name} </h3>
                                    {event.highlight && (
                                        <Pill text={event.highlight} color="primary" />
                                    )}
                                </div>
                                {event.metadata && (
                                    <div className=" grid grid-cols-2 gap-2 w-full">
                                        {event.metadata.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex flex-row gap-1 items-center"
                                            >
                                                {item.icon && (
                                                    <Icon
                                                        icon={item.icon}
                                                        size={12}
                                                        color="#DCE0E5"
                                                    />
                                                )}
                                                <p className=" leading-none font-mono text-xs text-gray-200">
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {event.description && (
                                    <div className=" text-sm text-gray-400/60">
                                        <p> {event.description} </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );
}

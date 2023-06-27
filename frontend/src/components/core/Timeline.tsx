import { Icon } from "@blueprintjs/core"
import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated-icons/16px/blueprint-icons-16.ts"
import Pill from "./Pill"

interface timelineEvent {
    id: string,
    name: string,
    description?: string,
    highlight?: string,
    icon?: BlueprintIcons_16Id
}

export default function Timeline(
    {
        events
    }: {
        events: timelineEvent[]
    }
) {
    return (
        <div>
            {events.map((event) => (
                <div key={event.id} className="flex flex-col w-full pb-4">
                    <div className="flex flex-row w-full gap-4 items-start">
                        <div className="outline outline-gray-400 rounded-full p-1.5 m-1">
                            <Icon icon={`${event.icon ? event.icon : "flag"}`} size={14} color="#F6F7F9" />
                        </div>
                        <div className=" flex flex-col items-start">
                            <div className=" flex flex-row w-full gap-2">
                                <h3 className=" font-semibold "> {event.name} </h3>
                                {event.highlight && <Pill text={event.highlight} color="primary" />}
                            </div>
                            <div className=" text-sm text-gray-400/60">
                                <p> {event.description} </p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
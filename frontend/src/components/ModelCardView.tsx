import { Icon } from "@blueprintjs/core";
import { Link } from "react-router-dom";

export default function ModelCardView({ modelName }: { modelName: string }) {
    return (
        <Link to={`/model/${modelName}`}>
            <div className="flex flex-row gap-4 outline outline-gray-200 hover:outline-blue-600 rounded-sm px-4 py-2 cursor-pointer items-center">
                <p className=" flex-grow font-semibold text-dark-600 text-sm lg:text-xl leading-none truncate">
                    {modelName}
                </p>
                <Icon icon="arrow-right" size={24} color="#DCE0E5" />
            </div>
        </Link>
    );
}

import { Icon } from "@blueprintjs/core"
import { Link } from "react-router-dom";

export default function ModelCardView(
    {
        modelName,
    } : {
        modelName: string,
    }
) {

    return (
        <Link to={`/model/${modelName}`}>
            <div className="flex flex-row gap-4 outline outline-gray-200 hover:outline-primary-300 rounded-sm p-3 cursor-pointer items-center">
                <p className=' flex-grow font-semibold text-dark-600 text-sm lg:text-xl leading-tight truncate'>{modelName}</p>
                <p className=' py-1 px-2 bg-primary-100 rounded-xl text-xs lg:text-sm text-dark-200 font-semibold truncate'>Completion</p>
                <Icon icon="arrow-right" size={24} color="#DCE0E5" />
            </div>
        </Link>
    )
}
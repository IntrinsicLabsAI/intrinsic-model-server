
export default function ModelCardView(
    {
        modelName,
    } : {
        modelName: string,
    }
) {

    return (
        <div className="flex flex-col gap-2 outline outline-gray-200 rounded-sm p-3 cursor-pointer">
            <p className=' py-1 px-2 mr-auto bg-primary-100 rounded-xl text-xs lg:text-sm text-dark-200 font-semibold truncate'>Completion</p>
            <p className=' font-semibold text-dark-600 text-sm lg:text-xl leading-tight truncate'>{modelName}</p>
        </div>
    )
}
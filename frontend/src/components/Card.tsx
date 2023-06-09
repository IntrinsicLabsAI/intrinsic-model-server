import { TrashIcon } from "@heroicons/react/20/solid";

export default function Card({
    title,
    version,
    guid,
    deleteHandler
}:{
    title: string,
    version: string,
    guid: string,
    deleteHandler: (arg: string) => void
}) {
  return (
    <div className=" container outline rounded-md p-4 cursor-pointer hover:outline-blue-500">
        <div className="flex flex-col h-20 gap-2">
            <div className="flex flex-row items-center leading-tight">
                <p className=" text-lg font-semibold ">{title}</p>
                <TrashIcon 
                    onClick={() => deleteHandler(guid)}
                    className="h-5 w-5 ml-auto hover:text-red-500 text-slate-500"/>
            </div>
            <div className="flex flex-row">
                <p className=" font-mono text-sm"><span className=" font-sans font-semibold ">Version: </span>{version}</p>
            </div>
            <div className="flex flex-row">
                <p className=" font-mono text-sm"><span className=" font-sans font-semibold ">Type: </span>Compleation</p>
            </div>
        </div>
    </div>
  );
}
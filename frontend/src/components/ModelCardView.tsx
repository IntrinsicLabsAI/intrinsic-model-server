import { useState } from 'react';
import { RegisteredModel } from '../api/models/RegisteredModel'
import TrashIcon from '@heroicons/react/20/solid/TrashIcon';

export default function ModelCardView(
    {
        modelName,
        modelVersions,
        deleteHandler
    } : {
        modelName: string,
        modelVersions: RegisteredModel[],
        deleteHandler: (arg: string) => void
    }
) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className='flex flex-col gap-2 w-full'>
            <div 
                className={`w-full outline rounded p-3 cursor-pointer ${!isOpen ? 'outline-slate-600' : 'outline-blue-400'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <p className=' text-sm text-slate-600 font-semibold'>Model</p>
                <p className=' font-semibold text-xl leading-tight'>{modelName}</p>
            </div>

            {(isOpen) ? (
                <div className=' pl-10 pr-6 pt-2 w-full '>
                    {modelVersions.map((modelVersion) => (
                        <div className=' flex flex-row pb-6 justify-center' key={modelVersion.guid}>
                            <p className=' font-medium font-mono text-slate-600 mr-4'>{modelVersion.version}</p>
                            <div className='flex flex-col'>
                                <p className=' font-semibold text-lg leading-none '>{modelVersion.name}</p>
                                <div className="flex flex-row gap-2 pt-2">
                                    <p className=' font-semibold text-slate-600 '>Type:</p>
                                    <p className=' font-semibold text-slate-600'>{modelVersion.model_type}</p>
                                </div>
                            </div>
                            <TrashIcon 
                                onClick={() => deleteHandler(modelVersion.guid)}
                                className="cursor-pointer h-4 w-4 ml-auto hover:text-red-500 text-slate-500"/>
                        </div>
                    ))}
                </div>
            ) : (
                null
            )}
        </div>
    )
}
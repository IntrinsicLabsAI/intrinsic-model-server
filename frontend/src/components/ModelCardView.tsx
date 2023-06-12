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
        <div className='flex flex-col gap-2 w-full outline outline-gray-200 rounded-sm'>
            <div 
                className={`w-full p-3 cursor-pointer`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <p className=' text-xs lg:text-sm text-dark-600 font-semibold truncate'>Completion</p>
                <p className=' font-semibold text-dark-600 text-sm lg:text-xl leading-tight truncate'>{modelName}</p>
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
                                className="cursor-pointer h-4 w-4 ml-auto hover:text-primary-400 text-gray-200"/>
                        </div>
                    ))}
                </div>
            ) : (
                null
            )}
        </div>
    )
}
import { Menu } from '@headlessui/react'
import React from 'react'

import {BlueprintIcons_16Id} from "@blueprintjs/icons/src/generated/16px/blueprint-icons-16.ts"
import { Icon } from '@blueprintjs/core'

export default function DropdownMenu<K extends React.Key, T extends { id: K, value: string }>({
    type,
    buttonText,
    buttonIcon,
    items,
    onSelectionChange
}: {
    type: 'text' | 'icon',
    buttonText?: string,
    buttonIcon?: BlueprintIcons_16Id
    items: T[],
    onSelectionChange?: (select: K) => void
}) {
    
    const updateSelected = (key: K) => { onSelectionChange && onSelectionChange(key) };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button>
                    {type === 'text' && (
                        <div className='flex flex-row items-center gap-2 outline outline-primary-600 px-2 py-1 rounded'>
                            {buttonIcon && <Icon icon={buttonIcon} size={16} color={"#53b79a"} />}
                            <p className='text-primary-600 font-semibold'>{buttonText}</p>
                        </div>
                    )}
                    {type === 'icon' && (
                        <div className='flex flex-row gap-2 p-2 hover:bg-slate-400/20 rounded items-center'>
                            <Icon icon={buttonIcon} size={20} color={"#53b79a"} />
                            {buttonText && <p className='text-primary-600 leading-none font-medium'>{buttonText}</p>}
                        </div>
                    )}
                </Menu.Button>
            </div>

            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded bg-gray-200">
                {
                    items.map(item => (
                        <Menu.Item key={item.id}>
                            <p
                                className="hover:bg-primary-100 hover:font-semibold cursor-pointer text-gray-100 block px-4 py-2 text-sm rounded"
                                onClick={() => updateSelected(item.id)}>
                                {item.value}
                            </p>
                        </Menu.Item>
                    ))
                }
            </Menu.Items>
        </Menu>
    )
}

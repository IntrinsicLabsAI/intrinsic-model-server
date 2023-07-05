import { Menu } from '@headlessui/react'
import React from 'react'
import Button from './Button'

import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated/16px/blueprint-icons-16.ts"
import { Icon } from '@blueprintjs/core'

export default function DropdownMenu<K extends React.Key, T extends { id: K, value: string, icon?: BlueprintIcons_16Id  }>({
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
                    <Button size="large" outline={false} buttonText={buttonText} buttonIcon={buttonIcon}/>
                </Menu.Button>
            </div>

            <Menu.Items className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded bg-gray-200">
                {
                    items.map(item => (
                        <Menu.Item key={item.id}>
                            <div className=' flex flex-row cursor-pointer items-center hover:bg-primary-100 hover:rounded'>
                                {item.icon && <div className=' ml-2 '><Icon icon={item.icon} size={14} color={"#404854"} /></div>}
                                <p className="font-semibold text-gray-100 block px-2 py-2 text-sm rounded leading-none"
                                    onClick={() => updateSelected(item.id)}>
                                    {item.value}
                                </p>
                            </div>
                        </Menu.Item>
                    ))
                }
            </Menu.Items>
        </Menu>
    )
}

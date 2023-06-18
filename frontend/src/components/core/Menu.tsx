import { Menu } from '@headlessui/react'
import React, { useMemo, useState } from 'react'

export default function Dropdown<K extends React.Key, T extends { id: K, value: string }>({
    buttonText,
    items,
    onSelectionChange,
    ...props
}: {
    buttonText: string,
    items: T[],
    onSelectionChange?: (select: K) => void,
    default?: K,
}) {
    const updateSelected = (key: K) => {
        onSelectionChange && onSelectionChange(key);
    };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button>
                    <p className='outline outline-primary-600 text-primary-600 font-semibold px-2 py-1 rounded'>{buttonText}</p>
                </Menu.Button>
            </div>

            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded bg-gray-400">
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

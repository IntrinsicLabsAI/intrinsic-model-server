import { Menu } from '@headlessui/react'
import React, { useMemo, useState } from 'react'

export default function Dropdown<K extends React.Key, T extends { id: K, value: string }>({
    buttonText,
    items,
    onSelectionChange,
}: {
    buttonText: string,
    items: T[],
    onSelectionChange?: (selection: K) => void,
}) {
    const [selection, setSelection] = useState<React.Key | undefined>();
    const selected = useMemo(() => items.find(it => it.id == selection), [selection, items])?.value;

    const updateSelected = (key: K) => {
        setSelection(key);
        if (onSelectionChange) {
            onSelectionChange(key);
        }
    };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button>
                    <p className=' bg-primary-100 text-dark-300 font-semibold px-2 py-1 rounded hover:bg-primary-300'>{selected || buttonText}</p>
                </Menu.Button>
            </div>

            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded bg-gray-400">
                {
                    items.map(item => (
                        <Menu.Item key={item.id}>
                            <p
                                className="hover:bg-primary-100 hover:font-semibold cursor-pointer text-gray-100 block px-4 py-2 text-sm"
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
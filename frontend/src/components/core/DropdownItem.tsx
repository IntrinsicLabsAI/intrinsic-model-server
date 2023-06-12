import { Menu } from '@headlessui/react'

export default function DropdownItem(
    {
        name
    }: {
        name: string
    }
) {
    return (
        <Menu.Item>
                <p className="hover:bg-primary-100 hover:font-semibold cursor-pointer text-gray-100 block px-4 py-2 text-sm">
                    {name}
                </p>
        </Menu.Item>
    )
}
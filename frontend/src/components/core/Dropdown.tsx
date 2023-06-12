import { Menu } from '@headlessui/react'

export default function Dropdown(
    {
        buttonText,
        children,
    }: {
        buttonText: string,
        children: React.ReactNode | React.ReactNode[],
    }
) {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button>
                    <p className=' bg-primary-100 text-dark-300 font-semibold px-3 py-1.5 rounded hover:bg-primary-300'>{buttonText}</p>
                </Menu.Button>
            </div>

            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded bg-gray-400">
                <div className="py-1">
                    {children}
                </div>
            </Menu.Items>
        </Menu>
    )
}
export default function Section({
    children
} : {
    children?: React.ReactNode | React.ReactNode[],
}) {
    return (
        <div className="flex flex-col w-full h-full bg-dark-500 rounded-md p-6">
            {children}
        </div>
    )
}

export default function Section({
    children
} : {
    children?: React.ReactNode | React.ReactNode[],
}) {
    return (
        <div className="flex flex-col w-full h-full bg-white outline outline-1 outline-slate-400 rounded-md p-6">
            {children}
        </div>
    )
}
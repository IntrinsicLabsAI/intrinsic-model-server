export default function Page(
    {
        children
    } : {
        children: React.ReactNode | React.ReactNode[],
    }
) {
    return (
        <div className="w-10/12 h-full pt-5 mx-auto">
            {children}
        </div>
    )
}
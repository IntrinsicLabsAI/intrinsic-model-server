export default function Page(
    {
        children,
        header
    }: {
        children: React.ReactNode | React.ReactNode[],
        header?: React.ReactNode
    }
) {
    return (
        <div className="h-full">
            {header && (
                <div className=" w-full mx-auto bg-dark-200">
                    <div className=" w-10/12 h-full pt-5 mx-auto ">
                        {header}
                    </div>
                </div>
            )}
            <div className=" w-10/12 h-full pt-5 mx-auto ">
                {children}
            </div>
        </div>
    )
}
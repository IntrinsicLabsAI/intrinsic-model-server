export default function Card(
    {
        children
    }:
    {
        children: React.ReactNode | React.ReactNode[],
    }
) {
    return (
        <div className=" w-full h-full p-4 rounded bg-dark-500/80 ">
            {children}
        </div>
    )
}
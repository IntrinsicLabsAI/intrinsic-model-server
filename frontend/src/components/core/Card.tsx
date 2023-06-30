export default function Card(
    {
        children,
        className
    }:
    {
        children: React.ReactNode | React.ReactNode[],
        className?: string
    }
) {
    return (
        <div className={`w-full p-4 rounded bg-dark-500/80 ${className} `}>
            {children}
        </div>
    )
}
export default function Pill(
    {
        text
    }: {
        text: string
    }) {
    
    return (
        <div className="px-3 py-1.5 bg-primary-100 rounded-3xl">
            <p className=" text-dark-200 font-bold text-sm">{text}</p>
        </div>
    )
}
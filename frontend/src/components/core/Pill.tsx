export default function Pill(
    {
        text,
        color
    }: {
        text: string,
        color?: "blue" | "purple" | "primary"
    }) {
    
    const colors = {
        blue: "bg-blue-200",
        purple: "bg-purple-200",
        primary: "bg-primary-200",
    }
    
    return (
        <div className={`${color ? colors[color] : "bg-primary-200"} px-3 py-1.5 rounded-3xl`}>
            <p className=" text-dark-200 font-bold text-sm">{text}</p>
        </div>
    )
}
export default function Pill(
    {
        text,
        color,
    }: {
        text: string,
        color?: "blue" | "purple" | "primary",
    }) {

    const colors = {
        blue: "bg-blue-500",
        purple: "bg-purple-400",
        primary: "bg-primary-400",
    }

    return (
        <div className={`${colors[color || "primary"]} px-3 py-1.5 rounded-3xl`}>
            <p className=" text-dark-200 font-bold text-sm">{text}</p>
        </div>
    )
}

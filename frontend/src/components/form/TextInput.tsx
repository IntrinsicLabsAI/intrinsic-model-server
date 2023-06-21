export default function TextInput(
    {
        setState,
        name,
        placeholder,
        disabled
    }:{
        setState: (newState: any) => void,
        name: string,
        placeholder?: string,
        disabled?: boolean
    }
) {
    return (
        <input  className={` w-full rounded-md ring-primary-600 ${disabled ? " bg-gray-200 placeholder-dark-500 font-semibold" : "bg-gray-400 placeholder-dark-500/70"} `}
                type="text"
                disabled={disabled ? true : false}
                onChange={(e) => setState(e.target.value)}
                placeholder={`${placeholder ? placeholder : ""}`}
                id={name} 
                name={name} />
    )
}
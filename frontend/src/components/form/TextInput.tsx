export default function TextInput(
    {
        setState,
        name,
        placeholder
    }:{
        setState: (newState: string) => void,
        name: string,
        placeholder?: string
    }
) {
    return (
        <input  className=" w-full rounded-md ring-primary-600 bg-gray-400 placeholder-dark-500/70"
                type="text"
                onChange={(e) => setState(e.target.value)}
                placeholder={`${placeholder ? placeholder : ""}`}
                id={name} 
                name={name} />
    )
}
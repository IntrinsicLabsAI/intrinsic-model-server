import { useState } from "react"

interface selectionButtonInfo {
    title: string,
    description: string,
    value: string,
}

function SelectionButton(
    {
        title,
        description,
        value,
        state,
        setState
    } : {
        title: string,
        description: string,
        value: string,
        state: string,
        setState: (newState: string) => void,
    }
) {
    return (
        <div 
            key={value}
            className={`${state == value ? 
                " bg-primary-100 p-4 outline outline-primary-600 rounded cursor-pointer" : 
                "p-4 outline outline-slate-400 rounded cursor-pointer"}`}
            onClick={() => setState(value)}>
                <h3 className={`leading-none text-lg font-semibold ${state == value ? " text-dark-200 "  : "text-slate-200"} `}>{title}</h3>
                <p className={` leading-tight pt-1 text-sm ${state == value ? " text-dark-200 "  : "text-slate-200"}`}>{description}</p>
        </div>
    )
}

export default function ButtonInput(
    {
        setState,
        options
    } : {
        setState: (newState: string) => void,
        options: selectionButtonInfo[],
    }
) {
    const [selection, setSelection] = useState("")

    const changeSelection = (newSelection: string) => {
        setSelection(newSelection)
        setState(newSelection)
    }

    return (
        <div className=" grid grid-cols-2 gap-4">
            {options.map((option) => (
            <SelectionButton 
                value={option.value} 
                title={option.title}
                description={option.description}
                state={selection} 
                setState={changeSelection}/>
            ))}
        </div>
    )
}
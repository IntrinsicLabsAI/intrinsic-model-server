import { useState } from "react"

export default function Input(
    {
        state
    }:{
        state?: string
    }
) {
    const [inputState, setInputState] = useState(state)

    return (
        <input  className=" w-full rounded-md" 
                onChange={(e) => setInputState(e.target.value)}
                type="text" 
                placeholder={inputState}
                id="name" 
                name="name" />
    )
}
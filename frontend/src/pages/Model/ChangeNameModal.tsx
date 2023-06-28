import Modal from "../../components/core/Modal"
import TextInput from "../../components/form/TextInput"
import { useState } from "react"

export default function ChangeNameModal(
    {
        isOpen,
        setIsOpen
    } : {
        isOpen: boolean,
        setIsOpen: (value: boolean) => void
    }) {
    const [ newName, setNewName ] = useState<string>()
    
    return (

        <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
            <div className="flex flex-col gap-4">
                <h3 className=" font-semibold text-xl">Rename this model</h3>
                <div className="flex flex-col gap-1">
                    <p className=" font-medium text-sm leading-none">Current Name</p>
                    <TextInput disabled placeholder="Current Model Name" name="current-name" />
                </div>
                <div className="flex flex-col gap-1">
                    <p className=" font-medium text-sm leading-none">New Model Name</p>
                    <TextInput placeholder="Current Model Name" name="new-name" onChange={setNewName} />
                </div>
                <div className="flex flex-col items-end pt-4">
                    <button 
                        className=" outline outline-primary-600 px-2 py-1 rounded bg-primary-400 disabled:outline-gray-600 disabled:opacity-25 disabled:bg-gray-400"
                        disabled={ newName == null || newName === "" }>
                        <p className=" text-dark-400 font-semibold">Change Name</p>
                    </button>
                </div>
            </div>
        </Modal>
    )
}
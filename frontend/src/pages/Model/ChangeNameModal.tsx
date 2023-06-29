import Modal from "../../components/core/Modal"
import TextInput from "../../components/form/TextInput"
import { useMemo, useState } from "react"
import { useUpdateModelNameMutation } from "../../api/services/v1"
import { useNavigate } from "react-router-dom"

const VALIDATION_REGEX = /^[a-zA-Z0-9-_.]+$/;

export default function ChangeNameModal(
    {
        isOpen,
        setIsOpen,
        modelName
    }: {
        isOpen: boolean,
        setIsOpen: (value: boolean) => void,
        modelName: string
    }) {
    const [newName, setNewName] = useState<string>("")
    const [updateNameAction] = useUpdateModelNameMutation();
    const navigate = useNavigate();

    const isValid = useMemo(() => {
        return VALIDATION_REGEX.test(newName);
    }, [newName]);

    return (
        <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
            <div className="flex flex-col">
                <h3 className=" font-semibold text-xl leading-none">Rename this model</h3>
                <p className=" mt-1 text-sm whitespace-pre-line">Model names should only include alphanumeric characters, dashes, underscores, and periods.</p>

                <div className="flex flex-col gap-1 mt-4">
                    <p className=" font-medium text-sm leading-none">Current Name</p>
                    <TextInput disabled placeholder={modelName} name="current-name" />
                </div>

                <div className="flex flex-col gap-1 mt-4">
                    <div className="flex flex-row gap-2">
                        <p className=" font-medium text-sm leading-none">New Name</p>
                        {(newName !== "" && !isValid) && <p className=" font-medium text-sm leading-none text-red-400">Please enter a valid model name.</p>}
                    </div>
                    <TextInput placeholder="new-model-name" name="new-name" onChange={setNewName} />
                </div>

                <div className="flex flex-col items-end pt-8">
                    <button
                        className=" outline outline-primary-600 px-2 py-1 rounded bg-primary-400 disabled:outline-gray-600 disabled:opacity-25 disabled:bg-gray-400"
                        disabled={newName === "" || !isValid}
                        onClick={() => {
                            updateNameAction({ modelName: modelName, name: newName })
                            setIsOpen(false)
                            navigate(`/model/${newName}`)
                        }}>
                        <p className=" text-dark-400 font-semibold">Change Name</p>
                    </button>
                </div>

            </div>
        </Modal>
    )
}
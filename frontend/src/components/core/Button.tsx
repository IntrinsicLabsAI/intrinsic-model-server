import { BlueprintIcons_16Id } from "@blueprintjs/icons/src/generated/16px/blueprint-icons-16.ts"
import { Icon } from '@blueprintjs/core'

export default function Button(
    {
        buttonText,
        buttonIcon,
        onAction,
        type
    } : {
        buttonText?: string,
        buttonIcon?: BlueprintIcons_16Id,
        onAction?: () => void,
        type: 'text' | 'icon'
    }
) {
    return (
        <>
            {type === 'icon' && (
                <div onClick={onAction} className=' cursor-pointer flex flex-row gap-2 p-2 hover:bg-slate-400/20 rounded items-center'>
                    {buttonIcon &&<Icon icon={buttonIcon} size={20} color={"#53b79a"} />}
                    {buttonText && <p className='text-primary-600 leading-none font-medium'>{buttonText}</p>}
                </div>
            )}
        </>
    )
}
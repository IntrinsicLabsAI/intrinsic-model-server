export default function TwoColumnLayout(
    {
        colOneContent,
        colTwoContent,
        type
    } : {
        colOneContent?: React.ReactNode | React.ReactNode[],
        colTwoContent?: React.ReactNode | React.ReactNode[],
        type: "left" | "right" | "equal"
    }
) {
    const typeOptions = {
        left:  ["w-2/3", "w-1/3"],
        right: ["w-1/3", "w-2/3"],
        equal: ["w-1/2", "w-1/2"]
    }

    return (
        <div className="flex flex-row w-full gap-5 pb-5">

            <div className={`${typeOptions[type][0]}`}>
                {colOneContent ? colOneContent : null}
            </div>

            <div className={`${typeOptions[type][1]}`}>
                {colTwoContent? colTwoContent : null}
            </div>

        </div>
    )
}
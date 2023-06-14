export default function OneColumnLayout(
    {
        colOneContent,
    } : {
        colOneContent?: React.ReactNode | React.ReactNode[],
    }
) {
    return (
        <div className="flex flex-row w-full gap-5 pb-5">
            <div className="w-full">
                {colOneContent ? colOneContent : null}
            </div>
        </div>
    )
}
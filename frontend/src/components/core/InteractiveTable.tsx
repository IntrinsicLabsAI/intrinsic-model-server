import { useState } from "react"

function InteractiveRow<T extends Record<string, string>>(
    {
        row,
        columns: extractors,
        onRowSelect,
        selectedRow
    } : {
        row: T,
        columns: Array<keyof T>,
        onRowSelect: (value: string) => void,
        selectedRow: string,
    }) {

        const cols = extractors.map(prop => row[prop])
        
        return (
            <tr onClick={() => onRowSelect(row.row_key)} className=" cursor-pointer ">
                {cols.map(rowValue => (
                    <td>
                        <p className={` ${selectedRow == row.row_key ? " text-primary-400 font-semibold " : " " } `}>{rowValue}</p>
                    </td>
                ))}
            </tr>
        )
}

export default function InteractiveTable<T extends Record<string, string>>(
    {
        rows,
        columns: extractors,
        onRowSelect,
    } : {
        rows: Array<T>,
        columns: Array<keyof T>,
        onRowSelect: (value: string) => void,
    }
) {
    const [selectedRow, setSelectedRow] = useState("")

    const handleRowSelect = (value: string) => {
        setSelectedRow(value);
        onRowSelect(value);
    }

    return (
        <table className=" w-full ">
            {rows.map(row => (
                <InteractiveRow
                    row={row}
                    columns={extractors}
                    onRowSelect={handleRowSelect}
                    selectedRow={selectedRow} />
            ))}
        </table>
    )
}
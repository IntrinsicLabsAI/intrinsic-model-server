import { useState } from "react";

function InteractiveRow<T extends Record<string, string>>({
    row,
    columns: extractors,
    onRowSelect,
    selectedRow,
    enableSelection,
}: {
    row: T;
    columns: Array<keyof T>;
    onRowSelect: (value: string) => void;
    selectedRow: string;
    enableSelection?: boolean;
}) {
    const cols = extractors.map((prop) => row[prop]);

    return (
        <tr
            onClick={() => onRowSelect(row.row_key)}
            className={` ${
                enableSelection && selectedRow == row.row_key
                    ? "bg-primary-400/30"
                    : "hover:bg-primary-400/10"
            } ${enableSelection ? "cursor-pointer" : ""}`}
        >
            <>
                {enableSelection && (
                    <td className={` border-l border-t border-b border-gray-400/40 text-left px-1`}>
                        <div className="flex flex-col items-center">
                            <input
                                className=" rounded "
                                checked={selectedRow == row.row_key}
                                type="checkbox"
                            />
                        </div>
                    </td>
                )}

                {cols.map((rowValue) => (
                    <td className={` border border-gray-400/40 text-left `}>
                        <p
                            className={`p-3 ${
                                enableSelection && selectedRow == row.row_key
                                    ? " text-gray-500 "
                                    : " "
                            } `}
                        >
                            {rowValue}
                        </p>
                    </td>
                ))}
            </>
        </tr>
    );
}

export default function InteractiveTable<T extends Record<string, string>>({
    rows,
    columns,
    onRowSelect,
    enableSelection,
    disableHeader,
}: {
    rows: Array<T>;
    columns: Array<keyof T>;
    onRowSelect?: (value: string) => void;
    enableSelection?: boolean;
    disableHeader?: boolean;
}) {
    const [selectedRow, setSelectedRow] = useState("");

    const handleRowSelect = (value: string) => {
        setSelectedRow(value);
        if (onRowSelect) onRowSelect(value);
    };

    return (
        <table className=" w-full ">
            {!disableHeader && (
                <thead>
                    <tr className=" bg-dark-200">
                        {enableSelection && (
                            <th className="border border-gray-400/40 text-left"></th>
                        )}
                        {columns.map((column) => (
                            <th className=" p-3 border border-gray-400/40 text-left">
                                <p>{String(column)}</p>
                            </th>
                        ))}
                    </tr>
                </thead>
            )}
            {rows.map((row) => (
                <InteractiveRow
                    row={row}
                    columns={columns}
                    enableSelection={enableSelection}
                    onRowSelect={handleRowSelect}
                    selectedRow={selectedRow}
                />
            ))}
        </table>
    );
}

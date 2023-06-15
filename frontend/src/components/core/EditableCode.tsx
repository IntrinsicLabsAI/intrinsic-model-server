import { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import ReactMarkdown from "react-markdown";
import React from 'react';

/**
 * A component that allows toggling between editor and preview functionality.
 * 
 * Also accepts a save action that can be dispatched to publish the updates back to the server.
 */
const EditableCode = React.memo(({
    initialCode,
    code,
    setCode,
    langage,
    className,
}: {
    initialCode: string,
    code?: string,
    setCode: (update: string) => void,
    langage: string,
    className?: string,
}) => {
    const [editing, setEditing] = useState(false);
    return (
        <div className={`overflow-y-auto [&::-webkit-scrollbar]:hidden h-full ${className || ""}`}>
            <div onClick={() => setEditing(true)} onBlur={() => setEditing(false)}>
                {
                    editing
                        ? <CodeEditor style={{
                            fontSize: 14,
                            backgroundColor: "",
                            minHeight: "300px",
                        }} value={code} placeholder={initialCode} onChange={(evt) => {
                            setCode(evt.target.value);
                        }} language={langage} />
                        : <ReactMarkdown
                            components={{
                                h1: ({ ...props }) => (<p className="text-xl underline" {...props} />),
                                h2: ({ ...props }) => (<p className="text-md underline" {...props} />),
                                p: ({ ...props }) => (<p className="text-sm" {...props} />),
                            }}
                            children={code || "Nothing"}
                            disallowedElements={["img", "script"]}
                            className="prose"
                        />
                }
            </div>
        </div>
    );
});

export default EditableCode;
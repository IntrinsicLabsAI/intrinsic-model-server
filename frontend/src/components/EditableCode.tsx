import { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import ReactMarkdown from "react-markdown";
import React from 'react';

import Widget from './core/Widget';
import { Icon } from "@blueprintjs/core";

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

    const markdownWidgetButton = (
        <div
            onClick={() => setEditing(!editing)} 
            className="p-1.5 rounded cursor-pointer hover:bg-slate-200/40">
            {editing ? 
                (<Icon icon="floppy-disk" size={14} color="#F6F7F9" />) :
                (<Icon icon="edit" size={14} color="#F6F7F9" />)}
        </div>
    );

    return (
        <Widget title="Details" header={markdownWidgetButton}>
            <div className={`overflow-y-auto [&::-webkit-scrollbar]:hidden h-full ${className || ""}`}>
                <>
                    { editing ? (<CodeEditor 
                                    style={{
                                        fontSize: 14,
                                        backgroundColor: "",
                                        minHeight: "300px",}} 
                                    value={code} 
                                    placeholder={initialCode} 
                                    onChange={(evt) => {setCode(evt.target.value);}} 
                                    language={langage} />) :
                                (<ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => (<p className="text-3xl underline" {...props} />),
                                        h2: ({ node, ...props }) => (<p className="text-xl underline" {...props} />),
                                        h3: ({ node, ...props }) => (<p className="text-lg underline" {...props} />),
                                        p: ({ node, ...props }) => (<p className="text-md" {...props} />),}}
                                    children={code || "Nothing"}
                                    disallowedElements={["img", "script"]}
                                    className="prose"/>)}
                </>
            </div>
        </Widget>
    )
});

export default EditableCode;
import { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import ReactMarkdown from "react-markdown";

/**
 * A component that allows toggling between editor and preview functionality.
 * 
 * Also accepts a save action that can be dispatched to publish the updates back to the server.
 */
export default function EditableCode({
    initialCode,
    langage,
    publish,
    className,
}: {
    initialCode: string,
    langage: string,
    publish: (code: string) => void,
    className?: string,
}) {
    const [editing, setEditing] = useState(false);
    const [code, setCode] = useState(initialCode);
    return (
        <div className={`overflow-y-auto h-full ${className || "" }`}>
            <div onClick={() => setEditing(true)} onBlur={() => setEditing(false)}>
                {
                    editing
                        ? <CodeEditor style={{
                            fontSize: 14,
                            backgroundColor: "",
                            minHeight: "300px",
                        }} value={code} onChange={(evt) => setCode(evt.target.value)} language={langage}  />
                        : <ReactMarkdown
                            components={{
                                h1: ({ ...props }) => (<p className="text-xl underline" {...props} />),
                                h2: ({ ...props }) => (<p className="text-md underline" {...props} />),
                                p: ({ ...props }) => (<p className="text-sm" {...props} />),
                            }}
                            children={code}
                            className="prose"
                        />
                }
            </div>
        </div>
    );
}

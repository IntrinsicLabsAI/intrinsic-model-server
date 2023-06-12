import { Icon } from "@blueprintjs/core"
import Dropdown from "../components/core/Dropdown"
import DropdownItem from "../components/core/DropdownItem"
import { useParams } from "react-router-dom";
import EditableCode from "../components/core/EditableCode";


export default function Model() {
    const { name } = useParams();

    const markdown =
        `# ${name}

\`\`\`javascript
function() {
  // Example of dispatching requests via fetch() API
  const result = await fetch("https://localhost:8000/v1/vicuna-7b/0.1.0/complete");
}
\`\`\`

# Have a loading indicator that can show how things are going...`;

    return (
        <div className="flex flex-col gap-5 pt-10 h-full w-full lg:w-8/12 mx-auto">
            <div className="flex flex-col outline outline-2 outline-dark-400 rounded">
                <div className="flex flex-row h-full gap-4 bg-dark-200 p-4">
                    <div className="w-14 h-14 bg-primary-100 rounded-sm">
                        <div className="flex flex-col h-full items-center justify-center">
                            <Icon icon="graph" size={32} color="#252A31" />
                        </div>
                    </div>
                    <div>
                        <h3 className=" text-gray-200 leading-none">Completion</h3>
                        <h1 className=" text-3xl">{name}</h1>
                    </div>
                    <div className="ml-auto">
                        <Dropdown buttonText="Actions">
                            <DropdownItem name="Delete Model" />
                        </Dropdown>
                    </div>
                </div>
            </div>

            <div className="flex h-96 gap-5">
                <EditableCode
                    initialCode={markdown}
                    langage="markdown"
                    publish={() => { /* unimplemented */ }}
                    className="w-3/4 shrink-0 outline outline-2 outline-dark-400 p-2" />
                <div className="w-1/4">
                    <div className="w-full h-full p-4 outline outline-2 outline-dark-400 rounded-sm">
                        <h3 className="mb-1 text-md font-medium">Versions</h3>
                        <div className="pt-4 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                            <div className="container h-20 bg-dark-200 rounded p-3 mb-2">
                                <p>Version One</p>
                            </div>
                            <div className="container h-20 bg-dark-200 rounded p-3 mb-2">
                                <p>Version Two</p>
                            </div>
                            <div className="container h-20 bg-dark-200 rounded p-3 mb-2">
                                <p>Version Three</p>
                            </div>
                            <div className="container h-20 bg-dark-200 rounded p-3 mb-2">
                                <p>Version Four</p>
                            </div>
                            <div className="container h-20 bg-dark-200 rounded p-3 mb-2">
                                <p>Version Five</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
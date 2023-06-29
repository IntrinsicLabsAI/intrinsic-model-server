import { Outlet, Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import DropdownMenu from '../components/core/DropdownMenu';
import Button from '../components/core/Button';
import { Status, StatusChecker } from "../api/services/statusService";
import { baseURL } from '../utils/prod';

export default function Workspace() {

    // Setup status checker in background.
    const [onlineState, setOnlineState] = useState<Status>("loading");

    useEffect(() => {
        // Create and mount a status checker on the beginning of page load.
        const checker = new StatusChecker(setOnlineState);
        checker.start();
        return () => {
            checker.stop();
        };
    }, []);
    
    const navigate = useNavigate();

    const actionsButton = (key: string) => {
        navigate(key);
    }

    return (
        <div className='bg-dark-300 '>
            <header className=' sticky top-0 z-50'>
                <div className='flex flex-row h-16 p-4 items-center bg-dark-100 gap-2'>
                    <Link to="/">
                        <p className="text-lg font-semibold">Intrinsic Server</p>
                    </Link>
                    <div className='ml-auto'>
                        <Button
                            type='icon'
                            buttonIcon="manual"
                            onAction={() => window.open(`${baseURL()}/docs`, "_blank")}
                        />
                    </div>
                    <DropdownMenu
                        type='icon'
                        buttonIcon='cube-add'
                        onSelectionChange={actionsButton}
                        items={[
                            { id: "new-model", value: "Add New Model" },
                        ]}
                    />
                    <div>
                        <div className='flex flex-col items-center outline outline-gray-400 rounded px-2 py-1'>

                            {onlineState === "online" && (
                                <div className='flex flex-row items-center gap-2'>
                                    <div className="w-3 h-3 bg-primary-600 rounded-full" />
                                    <p className=' text-sm font-semibold text-primary-400'>Online</p>
                                </div>
                            )}

                            {onlineState !== "online" && (
                                <div className='flex flex-row items-center gap-2'>
                                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                                    <p className=' text-sm font-semibold text-red-600'>Offline</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </header>
            <main className=' isolate h-[calc(100vh-4rem)] overflow-auto '>
                <Outlet />
            </main>
        </div>
    )
}
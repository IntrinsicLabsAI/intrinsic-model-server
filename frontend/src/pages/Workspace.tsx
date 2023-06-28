import { Outlet, Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import DropdownMenu from '../components/core/DropdownMenu';

export default function Workspace() {
    const navigate = useNavigate();

    const actionsButton = (key: string) => {
        navigate(key);
    }

    return (
        <div className='bg-dark-300 '>
            <header className=' sticky top-0 z-50'>
                <div className='flex flex-row h-16 p-4 items-center bg-dark-100 gap-2'>
                    <Link to="/">
                        <p className="text-lg font-semibold">Model Server</p>
                    </Link>
                    <div className='ml-auto'>
                        <DropdownMenu 
                            type='icon'
                            buttonIcon='cube-add'
                            onSelectionChange={actionsButton}
                            items={[
                                { id: "new-model", value: "Add New Model" },
                            ]}
                        />
                    </div>
                </div>
            </header>
            <main className=' isolate h-[calc(100vh-4rem)] overflow-auto '>
                <Outlet />
            </main>
        </div>
    )
}
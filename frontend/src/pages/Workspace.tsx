import { Outlet, Link } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/24/solid'

export default function Workspace() {
    return (
        <div className='bg-dark-300'>
            <header className='sticky top-0 z-50'>
                <div className='flex flex-row h-18 p-4 items-center bg-dark-200'>
                    <Link to="/">
                        <p className="text-lg font-semibold">Model Server</p>
                    </Link>
                    <a aria-label="View Server API Documentatio." className='ml-auto' href='http://127.0.0.1:8000/docs' rel="noopener" target="_blank">
                        <BookOpenIcon className="h-8 w-8 text-gray-400 pr-2" />
                    </a>
                </div>
            </header>
            <main className=' isolate '>
                <Outlet />
            </main>
        </div>
    )
}
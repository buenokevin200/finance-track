import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto w-full transition-all duration-200 ease-in-out">
                <div className="container mx-auto px-4 py-8 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

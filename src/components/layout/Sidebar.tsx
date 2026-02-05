import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import {
    LayoutDashboard,
    ArrowRightLeft,
    Wallet,
    PieChart,
    Settings,
    LogOut,
    Menu,
    X,
    Tag,
    Banknote
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/common/Button';

export const Sidebar = () => {
    const { t } = useTranslation();
    const logout = useAuthStore((state) => state.logout);
    const [isOpen, setIsOpen] = React.useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/' },
        { icon: ArrowRightLeft, label: t('nav.transactions'), path: '/transactions' },
        { icon: Wallet, label: t('nav.accounts'), path: '/accounts' },
        { icon: Tag, label: 'Categories', path: '/categories' },
        { icon: Banknote, label: 'Currencies', path: '/currencies' },
        { icon: PieChart, label: t('nav.budgets'), path: '/budgets' },
        { icon: Settings, label: t('nav.settings'), path: '/settings' },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
                onClick={toggleSidebar}
            >
                {isOpen ? <X /> : <Menu />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={clsx(
                "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:transform-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                        <Wallet className="h-8 w-8 text-blue-600 mr-3" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Firefly App</span>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => clsx(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200"
                                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={() => logout()}
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            {t('auth.login')}
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
};

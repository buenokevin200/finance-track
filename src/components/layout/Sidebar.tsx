import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
    Banknote,
    ChevronDown,
    Landmark,
    TrendingDown,
    TrendingUp,
    CreditCard
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/common/Button';

export const Sidebar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);
    const [isOpen, setIsOpen] = useState(false);
    const [isAccountsOpen, setIsAccountsOpen] = useState(location.pathname.startsWith('/accounts'));

    const navItems = [
        { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/' },
        { icon: ArrowRightLeft, label: t('nav.transactions'), path: '/transactions' },
        { 
            icon: Wallet, 
            label: t('nav.accounts'), 
            path: '/accounts',
            hasSubmenu: true,
            subItems: [
                { icon: Landmark, label: t('accounts.asset_accounts'), path: '/accounts?type=asset' },
                { icon: TrendingDown, label: t('accounts.expense_accounts'), path: '/accounts?type=expense' },
                { icon: TrendingUp, label: t('accounts.revenue_accounts'), path: '/accounts?type=revenue' },
                { icon: CreditCard, label: t('accounts.liabilities'), path: '/accounts?type=liabilities' },
            ]
        },
        { icon: Tag, label: t('nav.categories'), path: '/categories' },
        { icon: Banknote, label: t('nav.currencies'), path: '/currencies' },
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

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <div key={item.path}>
                                {item.hasSubmenu ? (
                                    <>
                                        <button
                                            onClick={() => setIsAccountsOpen(!isAccountsOpen)}
                                            className={clsx(
                                                "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                                location.pathname.startsWith(item.path)
                                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200"
                                                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                            )}
                                        >
                                            <div className="flex items-center">
                                                <item.icon className="mr-3 h-5 w-5" />
                                                {item.label}
                                            </div>
                                            <ChevronDown className={clsx(
                                                "h-4 w-4 transition-transform",
                                                isAccountsOpen && "rotate-180"
                                            )} />
                                        </button>
                                        <div className={clsx(
                                            "mt-1 space-y-1 overflow-hidden transition-all duration-200",
                                            isAccountsOpen ? "max-height-64 opacity-100" : "max-h-0 opacity-0"
                                        )}>
                                            {item.subItems?.map((subItem) => (
                                                <NavLink
                                                    key={subItem.path}
                                                    to={subItem.path}
                                                    onClick={() => setIsOpen(false)}
                                                    className={({ isActive }) => clsx(
                                                        "flex items-center pl-11 pr-4 py-2 text-xs font-medium rounded-md transition-colors",
                                                        isActive
                                                            ? "text-blue-600 dark:text-blue-400"
                                                            : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                                                    )}
                                                >
                                                    <subItem.icon className="mr-3 h-4 w-4" />
                                                    {subItem.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <NavLink
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
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={() => logout()}
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            {t('auth.logout')}
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
};

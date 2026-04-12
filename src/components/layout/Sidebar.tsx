import { useState } from 'react';
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
    CreditCard,
    Repeat
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
        { icon: Repeat, label: t('nav.subscriptions') || 'Suscripciones', path: '/subscriptions' },
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

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => (
                            <div key={item.path}>
                                {item.hasSubmenu ? (
                                    <>
                                        <button
                                            onClick={() => setIsAccountsOpen(!isAccountsOpen)}
                                            className={clsx(
                                                "w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group",
                                                location.pathname === item.path && !location.search
                                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                                    : location.pathname.startsWith(item.path)
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : "text-gray-600 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:bg-gray-700/50"
                                            )}
                                        >
                                            <div className="flex items-center">
                                                <div className={clsx(
                                                    "p-1.5 rounded-lg mr-3 transition-colors",
                                                    location.pathname.startsWith(item.path) 
                                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" 
                                                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-gray-600"
                                                )}>
                                                    <item.icon className="h-4 w-4" />
                                                </div>
                                                {item.label}
                                            </div>
                                            <ChevronDown className={clsx(
                                                "h-3.5 w-3.5 transition-transform duration-300 opacity-60",
                                                isAccountsOpen && "rotate-180"
                                            )} />
                                        </button>
                                        <div className={clsx(
                                            "mt-1 space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out",
                                            isAccountsOpen ? "max-h-64 opacity-100 py-1" : "max-h-0 opacity-0"
                                        )}>
                                            {item.subItems?.map((subItem) => {
                                                const isSubActive = location.pathname + location.search === subItem.path;
                                                return (
                                                    <NavLink
                                                        key={subItem.path}
                                                        to={subItem.path}
                                                        onClick={() => setIsOpen(false)}
                                                        className={clsx(
                                                            "group relative flex items-center pl-14 pr-4 py-2 text-[12.5px] font-medium rounded-xl transition-all duration-200",
                                                            isSubActive
                                                                ? "text-blue-600 bg-blue-50/40 dark:text-blue-400 dark:bg-blue-900/10"
                                                                : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/30"
                                                        )}
                                                    >
                                                        <>
                                                            {isSubActive && (
                                                                <span className="absolute left-6 top-2 bottom-2 w-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                                                            )}
                                                            <div className={clsx(
                                                                "mr-3 transition-colors",
                                                                isSubActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                                            )}>
                                                                <subItem.icon className="h-4 w-4" />
                                                            </div>
                                                            {subItem.label}
                                                        </>
                                                    </NavLink>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={({ isActive }) => clsx(
                                            "flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group",
                                            isActive
                                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                                : "text-gray-600 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:bg-gray-700/50"
                                        )}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <div className={clsx(
                                                    "p-1.5 rounded-lg mr-3 transition-colors",
                                                    isActive 
                                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" 
                                                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-gray-600"
                                                )}>
                                                    <item.icon className="h-4 w-4" />
                                                </div>
                                                {item.label}
                                            </>
                                        )}
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

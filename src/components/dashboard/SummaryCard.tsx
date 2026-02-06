import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    amount: string;
    icon: LucideIcon;
    trend?: string; // e.g., "+2.5%"
    trendUp?: boolean; // green if true, red if false (for positive trends)
    color?: 'blue' | 'green' | 'red' | 'purple';
}

export const SummaryCard = ({ title, amount, icon: Icon, trend, trendUp, color = 'blue' }: SummaryCardProps) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{amount}</h3>
                </div>
                <div className={clsx(
                    "p-3 rounded-full",
                    {
                        'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400': color === 'blue',
                        'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400': color === 'green',
                        'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400': color === 'red',
                        'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400': color === 'purple',
                    }
                )}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={clsx(
                        "font-medium",
                        trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                        {trend}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
                </div>
            )}
        </div>
    );
};

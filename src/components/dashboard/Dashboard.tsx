import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { SummaryCard } from './SummaryCard';
import { RecentTransactions } from './RecentTransactions';
import { fireflyService } from '@/services/firefly';
import { useAuthStore } from '@/store/useAuthStore';

export const Dashboard = () => {
    const { t } = useTranslation();
    const { fireflyUrl, fireflyToken } = useAuthStore();
    const [metrics, setMetrics] = useState({
        netWorth: '0.00',
        income: '0.00',
        expense: '0.00',
        billsToPay: '0.00'
    });

    useEffect(() => {
        if (!fireflyUrl || !fireflyToken) return;

        const fetchData = async () => {
            try {
                // Get start/end of current month
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

                const data = await fireflyService.getDashboardData(startOfMonth, endOfMonth);
                setMetrics({
                    netWorth: data.netWorth,
                    income: data.income,
                    expense: data.expenses,
                    billsToPay: data.billsToPay
                });
            } catch (e) {
                console.log('Failed to fetch dashboard data', e);
            }
        };

        fetchData();
    }, [fireflyUrl, fireflyToken]);

    if (!fireflyUrl || !fireflyToken) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">API Not Configured</h2>
                <p className="text-gray-500 mb-4">Please configure your Firefly III credentials in Settings to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('nav.dashboard')}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title={t('dashboard.total_balance')}
                    amount={`$${metrics.netWorth}`}
                    icon={Wallet}
                    color="blue"
                    trend="+12%" // Placeholder trend
                    trendUp={true}
                />
                <SummaryCard
                    title={t('dashboard.income')}
                    amount={`$${metrics.income}`}
                    icon={TrendingUp}
                    color="green"
                />
                <SummaryCard
                    title={t('dashboard.expenses')}
                    amount={`$${metrics.expense}`}
                    icon={TrendingDown}
                    color="red"
                />
                <SummaryCard
                    title={t('dashboard.bills_to_pay')}
                    amount="$0.00" // Placeholder
                    icon={DollarSign}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {/* Chart placeholder */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full min-h-[300px] flex items-center justify-center">
                        <p className="text-gray-400">Income vs Expense Chart (Coming Soon)</p>
                    </div>
                </div>
                <div>
                    <RecentTransactions />
                </div>
            </div>
        </div>
    );
};

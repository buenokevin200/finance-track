import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, ArrowRight } from 'lucide-react';
import { fireflyService, Transaction } from '@/services/firefly';
import { clsx } from 'clsx';

export const RecentTransactions = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const result = await fireflyService.getTransactions(1);
                setData(result.data || []);
            } catch (error) {
                console.error('Failed to fetch transactions', error);
                // Fallback for demo if API fails
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) return <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('dashboard.recent_transactions')}
                </h3>
                <Link
                    to="/transactions"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                >
                    {t('dashboard.view_all')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            <div className="space-y-4">
                {data.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent transactions (or API not configured)</p>
                ) : (
                    data.slice(0, 5).map((trx) => (
                        <div key={trx.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className={clsx(
                                    "p-2 rounded-full",
                                    trx.attributes.type === 'deposit'
                                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                )}>
                                    {trx.attributes.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{trx.attributes.description}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(trx.attributes.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <span className={clsx(
                                "font-semibold",
                                trx.attributes.type === 'deposit' ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"
                            )}>
                                {trx.attributes.type === 'deposit' ? '+' : '-'} {trx.attributes.currency_symbol} {Number(trx.attributes.amount).toFixed(2)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

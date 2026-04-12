import React, { useEffect, useState, useMemo } from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { 
    ArrowLeft, 
    TrendingUp, 
    TrendingDown, 
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Minus,
    Wallet,
    Pencil,
    Trash2
} from 'lucide-react';
import { fireflyService, Account, Transaction } from '@/services/firefly';
import { parseAccountNotes, calculateNextCutDate, calculateNextPaymentDate } from '@/utils/cardUtils';
import { Button } from '@/components/common/Button';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

interface ContentProps {
    account: Account;
    transactions: Transaction[];
    dateLocale: any;
    t: any;
    chartData: any[];
    handleBack: () => void;
}

const AccountContent: React.FC<ContentProps & { handleBack: () => void }> = ({ 
    account, 
    transactions, 
    dateLocale, 
    t, 
    chartData,
    handleBack
}) => {
    const navigate = useNavigate();
    const { attributes } = account;
    
    // Calculate stats for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(t => {
        const d = new Date(t.attributes.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
        .filter(t => t.attributes.type === 'deposit')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.attributes.amount)), 0);

    const expense = monthlyTransactions
        .filter(t => t.attributes.type === 'withdrawal')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.attributes.amount)), 0);

    const difference = income - expense;

    // Credit Card Alert Logic
    const isCreditCard = attributes.account_role === 'ccAsset';
    let daysToCut: number | null = null;
    let nextCutDate: Date | null = null;
    let nextPayDate: Date | null = null;
    let cutStatusColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

    if (isCreditCard && attributes.notes) {
        const { closing_day, payment_day } = parseAccountNotes(attributes.notes);
        if (closing_day) {
            nextCutDate = calculateNextCutDate(closing_day);
            if (nextCutDate) {
                const today = new Date();
                today.setHours(0,0,0,0);
                daysToCut = Math.ceil((nextCutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysToCut < 2) cutStatusColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                else if (daysToCut < 5) cutStatusColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
                
                if (payment_day) {
                    nextPayDate = calculateNextPaymentDate(payment_day, nextCutDate);
                }
            }
        }
    }

    const handleEdit = () => {
        navigate(`/accounts/edit/${account.id}`);
    };

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await fireflyService.deleteAccount(account.id);
            toast.success(t('common.deleted_successfully') || 'Cuenta eliminada con éxito');
            navigate('/accounts');
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Error al eliminar la cuenta');
        } finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title={t('accounts.delete')}
                message={t('accounts.delete_confirm')}
                isLoading={isDeleting}
            />
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-100 dark:border-gray-700 pb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {attributes.name}
                            {attributes.account_role && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    {t(`accounts.roles.${attributes.account_role}`) || attributes.account_role}
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(), 'MMMM yyyy', { locale: dateLocale })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={handleEdit} className="h-9 w-9 p-0 rounded-full">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => setIsConfirmOpen(true)} className="h-9 w-9 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {isCreditCard && (
                        <div className={`hidden sm:flex px-4 py-2 rounded-xl flex-col items-end ${daysToCut !== null ? cutStatusColor : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Días p/ corte</span>
                            <span className="text-xl font-black">{daysToCut !== null ? `${daysToCut} días` : 'No configurado'}</span>
                            {nextPayDate && <span className="text-[9px] opacity-70">Pagar en: {format(nextPayDate, 'dd MMM')}</span>}
                        </div>
                    )}

                    <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            {t('accounts.current_balance')}
                        </p>
                        <p className={`text-2xl font-bold tracking-tight ${
                            parseFloat(attributes.current_balance) < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                        }`}>
                            {attributes.currency_symbol} {parseFloat(attributes.current_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Trend Graph & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm h-[300px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                             <TrendingUp className="h-4 w-4 text-blue-500" />
                             Trend (30d)
                        </h3>
                    </div>
                    <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="date" 
                                hide={false} 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                minTickGap={30}
                            />
                            <YAxis hide={true} domain={['auto', 'auto']} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    borderRadius: '8px', 
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="balance" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorBalance)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-2.5 text-emerald-600 dark:text-emerald-400">
                            <ArrowUpRight className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('dashboard.income')}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {attributes.currency_symbol} {income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                        <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 p-2.5 text-rose-600 dark:text-rose-400">
                            <ArrowDownLeft className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('dashboard.expenses')}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {attributes.currency_symbol} {expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                        <div className={`rounded-lg p-2.5 ${difference >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'}`}>
                            {difference >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('common.diff') || 'Difference'}
                            </p>
                            <p className={`text-lg font-bold ${difference >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                                {attributes.currency_symbol} {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                        {t('dashboard.recent_transactions')}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    {t('transactions.date')}
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {t('transactions.description')}
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {t('transactions.category')}
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                                    {t('transactions.amount')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Minus className="h-10 w-10 mb-2 text-gray-300" />
                                            <p className="text-sm">{t('accounts.no_transactions') || 'Aún no hay movimientos en esta cuenta.'}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {format(new Date(transaction.attributes.date), 'dd MMM', { locale: dateLocale })}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {transaction.attributes.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                {transaction.attributes.category_name || t('transactions.no_category')}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                                            transaction.attributes.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                            {transaction.attributes.type === 'deposit' ? '+' : '-'}{transaction.attributes.currency_symbol}{Math.abs(parseFloat(transaction.attributes.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const AccountDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language === 'es' ? es : enUS;

    const [account, setAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const handleBack = () => {
        navigate(-1);
    };

    const chartData = useMemo(() => {
        if (!transactions.length || !account) return [];

        const data = [];
        let runningBalance = parseFloat(account.attributes.current_balance);
        const today = new Date();
        const sorted = [...transactions].sort((a, b) => 
            new Date(b.attributes.date).getTime() - new Date(a.attributes.date).getTime()
        );

        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = format(date, 'yyyy-MM-dd');
            data.unshift({ date: format(date, 'dd MMM'), balance: runningBalance });
            const dayTransactions = sorted.filter(t => t.attributes.date === dateStr);
            dayTransactions.forEach(t => { runningBalance -= parseFloat(t.attributes.amount); });
        }
        return data;
    }, [transactions, account]);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setAccount(null);
                setTransactions([]);
                const [accountData, transactionsData] = await Promise.all([
                    fireflyService.getAccount(id),
                    fireflyService.getAccountTransactions(id)
                ]);
                setAccount(accountData.data);
                setTransactions(transactionsData.data);
            } catch (error) {
                console.error('Error fetching account detail:', error);
                toast.error(t('errors.failed_fetch') || 'Error al cargar detalles de la cuenta');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    return (
        <div className="w-full h-full min-h-[400px]">
            {loading ? (
                <div className="flex h-96 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : !account ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800 mb-4">
                        <Wallet className="h-12 w-12 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('accounts.not_found') || 'Account not found'}</h2>
                    <Button onClick={handleBack} variant="secondary">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('common.back') || 'Back'}
                    </Button>
                </div>
            ) : (
                <AccountContent 
                    account={account} 
                    transactions={transactions} 
                    dateLocale={dateLocale} 
                    t={t} 
                    chartData={chartData} 
                    handleBack={handleBack}
                />
            )}
        </div>
    );
};

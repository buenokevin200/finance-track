import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowUpRight,
    ArrowDownLeft,
    ArrowRightLeft,
    Search,
    Filter,
    Plus
} from 'lucide-react';
import { clsx } from 'clsx';
import { fireflyService, Transaction } from '@/services/firefly';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { TransactionModal } from './TransactionModal';

export const Transactions = () => {
    const { t } = useTranslation();
    const { fireflyUrl } = useAuthStore();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'withdrawal' | 'deposit' | 'transfer'>('all');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const typeParam = filterType === 'all' ? undefined : filterType;
            const result = await fireflyService.getTransactions(page, typeParam);
            setTransactions(result.data || []);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (fireflyUrl) {
            fetchTransactions();
        }
    }, [fireflyUrl, page, filterType]);

    const handleCreate = () => {
        setSelectedTransaction(null);
        setIsModalOpen(true);
    };

    const handleEdit = (trx: Transaction) => {
        setSelectedTransaction(trx);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await fireflyService.deleteTransaction(id);
            fetchTransactions();
        } catch (error) {
            console.error('Failed to delete transaction', error);
            alert('Failed to delete transaction');
        }
    };

    const handleModalSubmit = async (data: any) => {
        try {
            if (selectedTransaction) {
                await fireflyService.updateTransaction(selectedTransaction.id, data);
            } else {
                await fireflyService.createTransaction(data);
            }
            fetchTransactions();
        } catch (error) {
            throw error;
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'deposit': return <ArrowDownLeft className="w-5 h-5" />;
            case 'withdrawal': return <ArrowUpRight className="w-5 h-5" />;
            case 'transfer': return <ArrowRightLeft className="w-5 h-5" />;
            default: return <ArrowRightLeft className="w-5 h-5" />;
        }
    };

    const getColorClass = (type: string) => {
        switch (type) {
            case 'deposit': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'withdrawal': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            case 'transfer': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('nav.transactions')}
                </h1>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Transaction
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-700 dark:text-gray-300"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                    >
                        <option value="all">All Types</option>
                        <option value="withdrawal">Withdrawals</option>
                        <option value="deposit">Deposits</option>
                        <option value="transfer">Transfers</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search description..."
                            className="w-full pl-9 pr-4 py-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ArrowRightLeft className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No transactions found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting filters or create a new one.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {transactions.map((trx) => (
                            <div key={trx.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={clsx("p-3 rounded-full", getColorClass(trx.attributes.type))}>
                                        {getIcon(trx.attributes.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {trx.attributes.description}
                                            </h4>
                                            {trx.attributes.category_name && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                    {trx.attributes.category_name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2 mt-1">
                                            <span>{new Date(trx.attributes.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{trx.attributes.source_name} → {trx.attributes.destination_name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={clsx(
                                        "font-bold block",
                                        trx.attributes.type === 'deposit' ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"
                                    )}>
                                        {trx.attributes.type === 'deposit' ? '+' : '-'}
                                        {trx.attributes.currency_symbol} {Number(trx.attributes.amount).toFixed(2)}
                                    </span>
                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity mt-1 space-x-2">
                                        <button
                                            onClick={() => handleEdit(trx)}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(trx.id)}
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Simple Pagination */}
            <div className="flex justify-center gap-4">
                <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="flex items-center text-sm font-medium">Page {page}</span>
                <Button variant="secondary" onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedTransaction}
            />
        </div>
    );
};

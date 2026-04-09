import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Wallet, Filter, Search } from 'lucide-react';
import { fireflyService, Account, AccountInput } from '@/services/firefly';
import { Button } from '@/components/common/Button';
import { AccountModal } from './AccountModal';

export const Accounts: React.FC = () => {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'asset' | 'expense' | 'revenue' | 'liability'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await fireflyService.getAccounts('all');
            setAccounts(data.data || []);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const filteredAccounts = useMemo(() => {
        return accounts.filter(account => {
            const matchesSearch = account.attributes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (account.attributes.account_number && account.attributes.account_number.includes(searchTerm));
            
            const matchesType = typeFilter === 'all' || account.attributes.type === typeFilter;
            
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && account.attributes.active) ||
                (statusFilter === 'inactive' && !account.attributes.active);

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [accounts, searchTerm, typeFilter, statusFilter]);

    const handleCreate = () => {
        setModalMode('create');
        setSelectedAccount(null);
        setIsModalOpen(true);
    };

    const handleEdit = (account: Account) => {
        setModalMode('edit');
        setSelectedAccount(account);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('accounts.delete_confirm'))) return;
        try {
            await fireflyService.deleteAccount(id);
            await fetchAccounts();
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Failed to delete account');
        }
    };

    const handleModalSubmit = async (data: AccountInput) => {
        try {
            if (modalMode === 'create') {
                await fireflyService.createAccount(data);
            } else if (selectedAccount) {
                await fireflyService.updateAccount(selectedAccount.id, data);
            }
            await fetchAccounts();
        } catch (error) {
            console.error('Error saving account:', error);
            alert('Failed to save account');
            throw error;
        }
    };

    const getInitialData = (): AccountInput | undefined => {
        if (!selectedAccount) return undefined;
        const attr = selectedAccount.attributes;
        return {
            name: attr.name,
            type: attr.type,
            currency_code: attr.currency_code,
            active: attr.active,
            iban: attr.iban,
            bic: attr.bic,
            account_number: attr.account_number,
            account_role: attr.account_role,
            notes: '', // Notes are usually not in attributes but separate or in a different structure
            virtual_balance: '',
        };
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accounts.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('accounts.manage')}</p>
                </div>
                <Button onClick={handleCreate} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('accounts.new')}
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('dashboard.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                
                <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2"
                    >
                        <option value="all">{t('common.all_types')}</option>
                        <option value="asset">{t('accounts.asset_accounts')}</option>
                        <option value="expense">{t('accounts.expense_accounts') || 'Cuentas de Gastos'}</option>
                        <option value="revenue">{t('accounts.revenue_accounts') || 'Cuentas de Ingresos'}</option>
                        <option value="liabilities">{t('accounts.liabilities') || 'Pasivos / Deudas'}</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2"
                    >
                        <option value="all">{t('common.all_status') || 'Todos los Estados'}</option>
                        <option value="active">{t('accounts.active')}</option>
                        <option value="inactive">{t('accounts.inactive')}</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAccounts.map((account: any) => {
                        const type = account.attributes.type;
                        const balance = parseFloat(account.attributes.current_balance || '0');
                        
                        // Define UI accents based on type
                        let balanceLabel = t('accounts.current_balance');
                        let balanceColor = 'text-gray-900 dark:text-white';
                        let displayBalance = balance;
                        let accentBg = 'bg-blue-50 dark:bg-blue-900/20';
                        let accentText = 'text-blue-600 dark:text-blue-400';

                        if (type === 'asset') {
                            balanceLabel = t('accounts.available_balance');
                            if (balance < 0) balanceColor = 'text-red-600 dark:text-red-400 font-bold';
                        } else if (type === 'expense') {
                            balanceLabel = t('accounts.spent_this_month');
                            displayBalance = Math.abs(balance);
                            accentBg = 'bg-rose-50 dark:bg-rose-900/20';
                            accentText = 'text-rose-600 dark:text-rose-400';
                        } else if (type === 'revenue') {
                            balanceLabel = t('accounts.received_this_month');
                            displayBalance = Math.abs(balance);
                            accentBg = 'bg-emerald-50 dark:bg-emerald-900/20';
                            accentText = 'text-emerald-600 dark:text-emerald-400';
                        } else if (type === 'liabilities' || type === 'liability') {
                            balanceLabel = t('accounts.current_debt');
                            accentBg = 'bg-slate-100 dark:bg-slate-700/50';
                            accentText = 'text-slate-600 dark:text-slate-400';
                        }

                        return (
                            <div
                                key={account.id}
                                className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div className={`rounded-lg p-2.5 transition-colors ${accentBg} ${accentText}`}>
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            onClick={() => handleEdit(account)}
                                            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 transition-colors"
                                            title={t('accounts.edit')}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(account.id)}
                                            className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700 transition-colors"
                                            title={t('accounts.delete')}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                        {account.attributes.name}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${accentBg} ${accentText}`}>
                                            {t(`accounts.${(type === 'liabilities' || type === 'liability') ? 'liabilities' : type + '_accounts'}`)}
                                        </span>
                                        {account.attributes.account_role && (
                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                                {t(`accounts.roles.${account.attributes.account_role}`) || account.attributes.account_role}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700">
                                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                                        {balanceLabel}
                                    </p>
                                    <p className={`text-xl font-bold tracking-tight ${balanceColor}`}>
                                        {account.attributes.currency_symbol} {displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {!account.attributes.active && (
                                    <div className="absolute top-3 right-3">
                                        <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" title={t('accounts.inactive')} />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredAccounts.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                            <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('accounts.no_accounts')}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{t('accounts.get_started')}</p>
                        </div>
                    )}
                </div>
            )}

            <AccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={getInitialData()}
                mode={modalMode}
            />
        </div>
    );
};

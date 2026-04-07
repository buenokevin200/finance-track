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
                        <option value="all">{t('common.all_types') || 'Todos los Tipos'}</option>
                        <option value="asset">{t('accounts.asset_accounts')}</option>
                        <option value="expense">{t('transactions.withdrawal')}</option>
                        <option value="revenue">{t('transactions.deposit')}</option>
                        <option value="liability">Liability</option>
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
                    {filteredAccounts.map((account) => (
                        <div
                            key={account.id}
                            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className={`rounded-full p-3 ${
                                    account.attributes.type === 'liability' ? 'bg-red-100 dark:bg-red-900' :
                                    account.attributes.type === 'asset' ? 'bg-blue-100 dark:bg-blue-900' :
                                    'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                    <Wallet className={`h-6 w-6 ${
                                        account.attributes.type === 'liability' ? 'text-red-600 dark:text-red-300' :
                                        account.attributes.type === 'asset' ? 'text-blue-600 dark:text-blue-300' :
                                        'text-gray-600 dark:text-gray-300'
                                    }`} />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(account)}
                                        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
                                        title={t('accounts.edit')}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(account.id)}
                                        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                                        title={t('accounts.delete')}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {account.attributes.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                                    {account.attributes.type}
                                </span>
                                {account.attributes.account_role && (
                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 capitalize">
                                        {account.attributes.account_role}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-end justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('accounts.current_balance')}</p>
                                    <p className={`text-xl font-bold ${
                                        parseFloat(account.attributes.current_balance) < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                                    }`}>
                                        {account.attributes.currency_symbol} {parseFloat(account.attributes.current_balance).toLocaleString()}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${account.attributes.active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {account.attributes.active ? t('accounts.active') : t('accounts.inactive')}
                                </span>
                            </div>
                        </div>
                    ))}

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

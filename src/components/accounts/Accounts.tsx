import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import { fireflyService, Account, AccountInput } from '@/services/firefly';
import { Button } from '@/components/common/Button';
import { AccountModal } from './AccountModal';

export const Accounts: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await fireflyService.getAccounts('asset'); // Fetch assets by default, maybe expand later
            // Firefly API returns { data: [...] }
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
        if (!confirm('Are you sure you want to delete this account?')) return;
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
        return {
            name: selectedAccount.attributes.name,
            type: selectedAccount.attributes.type,
            currency_code: selectedAccount.attributes.currency_symbol, // Mapping logic might need adjustment depending on API
            active: selectedAccount.attributes.active,
            balance: selectedAccount.attributes.current_balance
        };
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your bank accounts and wallets</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Account
                </Button>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((account) => (
                        <div
                            key={account.id}
                            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                                    <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(account)}
                                        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(account.id)}
                                        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                                {account.attributes.name}
                            </h3>
                            <p className="mb-4 text-sm text-gray-500 capitalize dark:text-gray-400">
                                {account.attributes.type}
                            </p>

                            <div className="flex items-end justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Balance</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {/* Simple formatting, ideally use Intl.NumberFormat */}
                                        {account.attributes.currency_symbol} {account.attributes.current_balance}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${account.attributes.active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {account.attributes.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}

                    {accounts.length === 0 && (
                        <div className="col-span-full py-12 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                <Wallet className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">No accounts found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Get started by creating your first account.</p>
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

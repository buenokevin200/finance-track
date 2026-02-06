import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, Ban } from 'lucide-react';
import { fireflyService, Currency } from '@/services/firefly';
import { Button } from '@/components/common/Button';
import { CurrencyModal } from './CurrencyModal';
import { clsx } from 'clsx';

export const Currencies: React.FC = () => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

    const fetchCurrencies = async () => {
        try {
            setLoading(true);
            const data = await fireflyService.getCurrencies();
            setCurrencies(data.data || []);
        } catch (error) {
            console.error('Error fetching currencies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const handleCreate = () => {
        setModalMode('create');
        setSelectedCurrency(null);
        setIsModalOpen(true);
    };

    const handleEdit = (currency: Currency) => {
        setModalMode('edit');
        setSelectedCurrency(currency);
        setIsModalOpen(true);
    };

    const handleDelete = async (code: string) => {
        if (!confirm('Are you sure you want to delete this currency?')) return;
        try {
            await fireflyService.deleteCurrency(code);
            await fetchCurrencies();
        } catch (error) {
            console.error('Error deleting currency:', error);
            alert('Failed to delete currency. It might be in use.');
        }
    };

    const handleToggleEnable = async (currency: Currency) => {
        try {
            if (currency.attributes.enabled) {
                await fireflyService.disableCurrency(currency.attributes.code);
            } else {
                await fireflyService.enableCurrency(currency.attributes.code);
            }
            await fetchCurrencies();
        } catch (error) {
            console.error('Error toggling currency:', error);
            alert('Failed to update currency status');
        }
    };

    const handleModalSubmit = async (data: { code: string; name: string; symbol: string; decimal_places: number }) => {
        try {
            if (modalMode === 'create') {
                await fireflyService.createCurrency({
                    ...data,
                    enabled: true
                });
            } else if (selectedCurrency) {
                await fireflyService.updateCurrency(selectedCurrency.attributes.code, {
                    ...data,
                    enabled: selectedCurrency.attributes.enabled
                });
            }
            await fetchCurrencies();
        } catch (error) {
            console.error('Error saving currency:', error);
            const msg = (error as any)?.response?.data?.message || 'Failed to save currency';
            alert(msg);
            throw error;
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Currencies</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage available currencies for your accounts.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Currency
                </Button>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Symbol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                            {currencies.map((currency) => (
                                <tr key={currency.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        {currency.attributes.code}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {currency.attributes.name}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {currency.attributes.symbol}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className={clsx(
                                            "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                                            currency.attributes.enabled
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                        )}>
                                            {currency.attributes.enabled ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleToggleEnable(currency)}
                                                className={clsx(
                                                    "rounded p-1",
                                                    currency.attributes.enabled
                                                        ? "text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                                        : "text-green-500 hover:bg-green-50 hover:text-green-600"
                                                )}
                                                title={currency.attributes.enabled ? "Disable" : "Enable"}
                                            >
                                                {currency.attributes.enabled ? <Ban className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(currency)}
                                                className="rounded p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            {!currency.attributes.default && (
                                                <button
                                                    onClick={() => handleDelete(currency.attributes.code)}
                                                    className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {currencies.length === 0 && (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            No currencies found. Add one to get started.
                        </div>
                    )}
                </div>
            )}

            <CurrencyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedCurrency ? {
                    code: selectedCurrency.attributes.code,
                    name: selectedCurrency.attributes.name,
                    symbol: selectedCurrency.attributes.symbol,
                    decimal_places: selectedCurrency.attributes.decimal_places || 2
                } : undefined}
                mode={modalMode}
            />
        </div>
    );
};

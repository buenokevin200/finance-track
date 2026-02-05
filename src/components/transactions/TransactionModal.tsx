import React, { useState, useEffect } from 'react';
import { X, Calendar, ArrowRightLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { fireflyService, Account, Category, Currency } from '@/services/firefly';
import { clsx } from 'clsx';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'withdrawal' | 'deposit' | 'transfer'>('withdrawal');

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Selectors Data
    const [assetAccounts, setAssetAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);

    // Selected Values
    const [sourceId, setSourceId] = useState('');
    const [destinationId, setDestinationId] = useState('');
    const [sourceName, setSourceName] = useState(''); // For deposit (Payer)
    const [destinationName, setDestinationName] = useState(''); // For withdrawal (Payee)
    const [categoryId, setCategoryId] = useState('');
    const [currencyCode, setCurrencyCode] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountsRes, categoriesRes, currenciesRes] = await Promise.all([
                    fireflyService.getAccounts('asset'),
                    fireflyService.getCategories(),
                    fireflyService.getCurrencies()
                ]);
                setAssetAccounts(accountsRes.data || []);
                setCategories(categoriesRes.data || []);
                setCurrencies(currenciesRes.data || []);

                // Set default currency if available
                if (currenciesRes.data && currenciesRes.data.length > 0) {
                    const defaultCurr = currenciesRes.data.find((c: Currency) => c.attributes.default) || currenciesRes.data[0];
                    setCurrencyCode(defaultCurr.attributes.code);
                }
            } catch (error) {
                console.error('Failed to load form data', error);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            const attrs = initialData.attributes;
            setType(attrs.type);
            setDescription(attrs.description);
            setAmount(attrs.amount);
            setDate(attrs.date ? new Date(attrs.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

            // Handle Source/Dest mapping based on type
            if (attrs.type === 'withdrawal') {
                setSourceId(attrs.source_id || '');
                setDestinationName(attrs.destination_name || '');
            } else if (attrs.type === 'deposit') {
                setSourceName(attrs.source_name || '');
                setDestinationId(attrs.destination_id || '');
            } else {
                setSourceId(attrs.source_id || '');
                setDestinationId(attrs.destination_id || '');
            }

            setCategoryId(attrs.category_id || '');
            setCurrencyCode(attrs.currency_code || '');
        } else {
            // Reset form
            setDescription('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setSourceId('');
            setDestinationId('');
            setSourceName('');
            setDestinationName('');
            setCategoryId('');
            // Currency code preserved if already set
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: any = {
            type,
            date,
            amount,
            description,
            currency_code: currencyCode,
            category_id: categoryId || undefined,
        };

        if (type === 'withdrawal') {
            payload.source_id = sourceId;
            payload.destination_name = destinationName;
        } else if (type === 'deposit') {
            payload.source_name = sourceName;
            payload.destination_id = destinationId;
        } else { // transfer
            payload.source_id = sourceId;
            payload.destination_id = destinationId;
        }

        try {
            await onSubmit(payload);
            onClose();
        } catch (error) {
            console.error('Error saving transaction', error);
            alert('Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 my-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {initialData ? 'Edit Transaction' : 'New Transaction'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Selector */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setType('withdrawal')}
                            className={clsx(
                                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                type === 'withdrawal'
                                    ? "bg-white dark:bg-gray-600 text-red-600 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <ArrowUpRight className="w-4 h-4" /> Withdrawal
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('deposit')}
                            className={clsx(
                                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                type === 'deposit'
                                    ? "bg-white dark:bg-gray-600 text-green-600 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <ArrowDownLeft className="w-4 h-4" /> Deposit
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('transfer')}
                            className={clsx(
                                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                type === 'transfer'
                                    ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <ArrowRightLeft className="w-4 h-4" /> Transfer
                        </button>
                    </div>

                    {/* Main Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Description
                            </label>
                            <input
                                type="text"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder="What's this for?"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Amount
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 pl-3 pr-20 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    placeholder="0.00"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <select
                                        value={currencyCode}
                                        onChange={(e) => setCurrencyCode(e.target.value)}
                                        className="h-full rounded-r-md border-l border-gray-300 bg-gray-50 py-0 pl-2 pr-7 text-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm"
                                    >
                                        {currencies.map(c => (
                                            <option key={c.attributes.code} value={c.attributes.code}>
                                                {c.attributes.code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Source / Destination Logic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700">
                        {/* SOURCE */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                From
                            </label>
                            {type === 'deposit' ? (
                                <input
                                    type="text"
                                    required
                                    value={sourceName}
                                    onChange={(e) => setSourceName(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Payer Name (e.g. Employer)"
                                />
                            ) : (
                                <select
                                    required
                                    value={sourceId}
                                    onChange={(e) => setSourceId(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Select Asset Account</option>
                                    {assetAccounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.attributes.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* DESTINATION */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                To
                            </label>
                            {type === 'withdrawal' ? (
                                <input
                                    type="text"
                                    required
                                    value={destinationName}
                                    onChange={(e) => setDestinationName(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Payee Name (e.g. Supermarket)"
                                />
                            ) : (
                                <select
                                    required
                                    value={destinationId}
                                    onChange={(e) => setDestinationId(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Select Asset Account</option>
                                    {assetAccounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.attributes.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category (Optional)
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">No Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.attributes.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            {initialData ? 'Save Changes' : 'Create Transaction'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

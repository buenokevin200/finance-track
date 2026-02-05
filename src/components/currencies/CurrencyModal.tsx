import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface CurrencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { code: string; name: string; symbol: string; decimal_places: number }) => Promise<void>;
    initialData?: { code: string; name: string; symbol: string; decimal_places: number };
    mode: 'create' | 'edit';
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode
}) => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [decimalPlaces, setDecimalPlaces] = useState(2);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setCode(initialData.code);
            setName(initialData.name);
            setSymbol(initialData.symbol);
            setDecimalPlaces(initialData.decimal_places);
        } else {
            setCode('');
            setName('');
            setSymbol('');
            setDecimalPlaces(2);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ code, name, symbol, decimal_places: decimalPlaces });
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {mode === 'create' ? 'Add Currency' : 'Edit Currency'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Currency Code (ISO 4217)
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={3}
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            disabled={mode === 'edit'}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 uppercase focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="USD"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="US Dollar"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Symbol
                        </label>
                        <input
                            type="text"
                            required
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="$"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Decimal Places
                        </label>
                        <input
                            type="number"
                            required
                            min={0}
                            max={4}
                            value={decimalPlaces}
                            onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            {mode === 'create' ? 'Add Currency' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { AccountInput } from '@/services/firefly';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AccountInput) => Promise<void>;
    initialData?: AccountInput;
    mode: 'create' | 'edit';
}

export const AccountModal: React.FC<AccountModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<AccountInput>({
        name: '',
        type: 'asset',
        currency_code: 'USD',
        active: true,
        opening_balance: '0',
        opening_balance_date: new Date().toISOString().split('T')[0],
        iban: '',
        bic: '',
        account_number: '',
        account_role: 'defaultAsset',
        notes: '',
        virtual_balance: '',
        liability_type: 'loan',
        liability_amount: '0',
        interest: '0',
        interest_period: 'monthly'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                currency_code: initialData.currency_code || 'USD',
                active: initialData.active ?? true,
                opening_balance: initialData.opening_balance || '0',
                opening_balance_date: initialData.opening_balance_date || new Date().toISOString().split('T')[0],
            });
        } else {
            setFormData({
                name: '',
                type: 'asset',
                currency_code: 'USD',
                active: true,
                opening_balance: '0',
                opening_balance_date: new Date().toISOString().split('T')[0],
                iban: '',
                bic: '',
                account_number: '',
                account_role: 'defaultAsset',
                notes: '',
                virtual_balance: '',
                liability_type: 'loan',
                liability_amount: '0',
                interest: '0',
                interest_period: 'monthly'
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-10">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 m-4">
                <div className="mb-4 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10 py-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {mode === 'create' ? t('accounts.new') : t('accounts.edit')}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mandatory Fields */}
                        <div className="col-span-full">
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('accounts.name')} *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('accounts.type')} *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="asset">{t('accounts.asset_accounts')}</option>
                                <option value="expense">{t('nav.categories')}</option> {/* Usually payees */}
                                <option value="revenue">{t('nav.budgets')}</option> {/* Usually payers */}
                                <option value="liability">Liability</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('accounts.currency')} *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.currency_code}
                                onChange={(e) => setFormData({ ...formData, currency_code: e.target.value.toUpperCase() })}
                                maxLength={3}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Optional Common Fields */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('accounts.iban')}
                            </label>
                            <input
                                type="text"
                                value={formData.iban || ''}
                                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('accounts.bic')}
                            </label>
                            <input
                                type="text"
                                value={formData.bic || ''}
                                onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('accounts.account_number')}
                            </label>
                            <input
                                type="text"
                                value={formData.account_number || ''}
                                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center space-x-2 py-4">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('accounts.active_label')}
                            </label>
                        </div>

                        {/* Conditionals */}
                        {formData.type === 'asset' && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('accounts.account_role')}
                                </label>
                                <select
                                    value={formData.account_role}
                                    onChange={(e) => setFormData({ ...formData, account_role: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="defaultAsset">{t('accounts.roles.defaultAsset')}</option>
                                    <option value="savingsAsset">{t('accounts.roles.savingsAsset')}</option>
                                    <option value="ccAsset">{t('accounts.roles.ccAsset')}</option>
                                    <option value="cashWalletAsset">{t('accounts.roles.cashWalletAsset')}</option>
                                </select>
                            </div>
                        )}

                        {mode === 'create' && (
                            <>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('accounts.opening_balance')}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.opening_balance}
                                        onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('accounts.opening_balance_date')}
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.opening_balance_date}
                                        onChange={(e) => setFormData({ ...formData, opening_balance_date: e.target.value })}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </>
                        )}

                        {formData.type === 'liability' && (
                            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('accounts.liability_type')}
                                    </label>
                                    <select
                                        value={formData.liability_type}
                                        onChange={(e) => setFormData({ ...formData, liability_type: e.target.value as any })}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="loan">Loan</option>
                                        <option value="debt">Debt</option>
                                        <option value="mortgage">Mortgage</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('accounts.interest')}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.interest}
                                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('accounts.interest_period')}
                                    </label>
                                    <select
                                        value={formData.interest_period}
                                        onChange={(e) => setFormData({ ...formData, interest_period: e.target.value as any })}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="weekly">{t('accounts.periods.weekly')}</option>
                                        <option value="monthly">{t('accounts.periods.monthly')}</option>
                                        <option value="quarterly">{t('accounts.periods.quarterly')}</option>
                                        <option value="half-year">{t('accounts.periods.half-year')}</option>
                                        <option value="yearly">{t('accounts.periods.yearly')}</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="col-span-full">
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('accounts.notes')}
                            </label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3 sticky bottom-0 bg-white dark:bg-gray-800 z-10 py-4 border-t border-gray-100 dark:border-gray-700">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            {mode === 'create' ? t('accounts.new') : t('accounts.save')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

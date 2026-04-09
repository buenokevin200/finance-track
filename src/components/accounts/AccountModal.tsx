import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { AccountInput, fireflyService } from '@/services/firefly';

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
        liability_direction: 'credit',
        interest: '0',
        interest_period: 'monthly'
    });
    const [loading, setLoading] = useState(false);
    const [currencies, setCurrencies] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const curData = await fireflyService.getCurrencies();
                setCurrencies(curData.data || []);
            } catch (error) {
                console.error('Error fetching modal data:', error);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                type: initialData.type === 'liability' ? 'liabilities' : initialData.type,
                currency_code: initialData.currency_code || 'USD',
                active: initialData.active ?? true,
                opening_balance: initialData.opening_balance || '0',
                opening_balance_date: initialData.opening_balance_date || new Date().toISOString().split('T')[0],
                liability_direction: (initialData as any).liability_direction || 'credit',
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
                liability_direction: 'credit',
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
            const submissionData = { ...formData };
            if (submissionData.type === 'liabilities') {
                submissionData.liability_amount = submissionData.opening_balance;
            }
            await onSubmit(submissionData);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {mode === 'create' ? t('accounts.new') : t('accounts.edit')}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Primary Field - NAME always on top and outside grid */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t('accounts.name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. My Savings Account"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('accounts.type')} *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="asset">{t('accounts.asset_accounts')}</option>
                                <option value="expense">{t('accounts.expense_accounts') || 'Cuentas de Gastos'}</option>
                                <option value="revenue">{t('accounts.revenue_accounts') || 'Cuentas de Ingresos'}</option>
                                <option value="liabilities">{t('accounts.liabilities') || 'Pasivos / Deudas'}</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('accounts.currency')} *
                            </label>
                            <select
                                required
                                value={formData.currency_code}
                                onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                {currencies.map((currency: any) => (
                                    <option key={currency.id} value={currency.attributes.code}>
                                        {currency.attributes.code} - {currency.attributes.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('accounts.iban')}
                            </label>
                            <input
                                type="text"
                                value={formData.iban || ''}
                                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('accounts.bic')}
                            </label>
                            <input
                                type="text"
                                value={formData.bic || ''}
                                onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('accounts.account_number')}
                            </label>
                            <input
                                type="text"
                                value={formData.account_number || ''}
                                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center pt-6">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{t('accounts.active_label')}</span>
                            </label>
                        </div>
                    </div>

                    {/* Dynamic Sections */}
                    {formData.type === 'asset' && (
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('accounts.account_role')}
                            </label>
                            <select
                                value={formData.account_role}
                                onChange={(e) => setFormData({ ...formData, account_role: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="defaultAsset">{t('accounts.roles.defaultAsset')}</option>
                                <option value="sharedAsset">{t('accounts.roles.sharedAsset')}</option>
                                <option value="savingsAsset">{t('accounts.roles.savingsAsset')}</option>
                                <option value="cashWalletAsset">{t('accounts.roles.cashWalletAsset')}</option>
                            </select>
                        </div>
                    )}

                    {mode === 'create' && (formData.type === 'asset' || formData.type === 'liabilities') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {formData.type === 'liabilities' ? t('accounts.liability_amount') : t('accounts.opening_balance')}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.opening_balance}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {formData.type === 'liabilities' ? 'Start date of debt' : t('accounts.opening_balance_date')}
                                </label>
                                <input
                                    type="date"
                                    value={formData.opening_balance_date}
                                    onChange={(e) => setFormData({ ...formData, opening_balance_date: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    {formData.type === 'liabilities' && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-4 shadow-inner">
                            <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
                                <span className="mr-2 text-blue-500">◈</span>
                                {t('accounts.liability_details')}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('accounts.liability_type')}
                                    </label>
                                    <select
                                        value={formData.liability_type}
                                        onChange={(e) => setFormData({ ...formData, liability_type: e.target.value as any })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="loan">{t('accounts.liability_types.loan')}</option>
                                        <option value="debt">{t('accounts.liability_types.debt')}</option>
                                        <option value="mortgage">{t('accounts.liability_types.mortgage')}</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('accounts.liability_direction')}
                                    </label>
                                    <select
                                        value={formData.liability_direction}
                                        onChange={(e) => setFormData({ ...formData, liability_direction: e.target.value as any })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="credit">{t('accounts.liability_in')}</option>
                                        <option value="debit">{t('accounts.liability_out')}</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('accounts.interest')}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.interest}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('accounts.interest_period')}
                                    </label>
                                    <select
                                        value={formData.interest_period}
                                        onChange={(e) => setFormData({ ...formData, interest_period: e.target.value as any })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="daily">{t('accounts.periods.daily')}</option>
                                        <option value="weekly">{t('accounts.periods.weekly')}</option>
                                        <option value="monthly">{t('accounts.periods.monthly')}</option>
                                        <option value="quarterly">{t('accounts.periods.quarterly')}</option>
                                        <option value="half-year">{t('accounts.periods.half-year')}</option>
                                        <option value="yearly">{t('accounts.periods.yearly')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1 pb-4">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t('accounts.notes')}
                        </label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="Add any extra details here..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </form>

                {/* Sticky Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 space-x-3">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" isLoading={loading} onClick={(e) => handleSubmit(e as any)}>
                        {mode === 'create' ? t('accounts.new') : t('accounts.save')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

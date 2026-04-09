import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Landmark, Globe } from 'lucide-react';
import { AccountInput } from '@/services/firefly';

interface BasicFieldsProps {
    formData: AccountInput;
    setFormData: (data: AccountInput) => void;
    currencies: any[];
}

export const BasicFields: React.FC<BasicFieldsProps> = ({ formData, setFormData, currencies }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-gray-400" />
                    {t('accounts.name')} <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Cuenta Principal, Supermercado..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-gray-400" />
                        {t('accounts.type')} *
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="asset">{t('accounts.asset_accounts')}</option>
                        <option value="expense">{t('accounts.expense_accounts')}</option>
                        <option value="revenue">{t('accounts.revenue_accounts')}</option>
                        <option value="liabilities">{t('accounts.liabilities')}</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        {t('accounts.currency')} *
                    </label>
                    <select
                        required
                        value={formData.currency_code}
                        onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        {currencies.map((currency: any) => (
                            <option key={currency.id} value={currency.attributes.code}>
                                {currency.attributes.code} - {currency.attributes.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

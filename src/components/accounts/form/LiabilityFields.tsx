import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldQuestion } from 'lucide-react';
import { AccountInput } from '@/services/firefly';

interface LiabilityFieldsProps {
    formData: AccountInput;
    setFormData: (data: AccountInput) => void;
}

export const LiabilityFields: React.FC<LiabilityFieldsProps> = ({ formData, setFormData }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl space-y-4 shadow-inner border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
            <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
                <ShieldQuestion className="mr-2 h-4 w-4 text-blue-500" />
                {t('accounts.liability_details')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('accounts.liability_type')}</label>
                    <select
                        value={formData.liability_type}
                        onChange={(e) => setFormData({ ...formData, liability_type: e.target.value as any })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="loan">{t('accounts.liability_types.loan')}</option>
                        <option value="debt">{t('accounts.liability_types.debt')}</option>
                        <option value="mortgage">{t('accounts.liability_types.mortgage')}</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('accounts.liability_direction')}</label>
                    <select
                        value={formData.liability_direction}
                        onChange={(e) => setFormData({ ...formData, liability_direction: e.target.value as any })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="credit">{t('accounts.liability_in')}</option>
                        <option value="debit">{t('accounts.liability_out')}</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('accounts.interest')} (%)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.interest}
                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('accounts.interest_period')}</label>
                    <select
                        value={formData.interest_period}
                        onChange={(e) => setFormData({ ...formData, interest_period: e.target.value as any })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
    );
};

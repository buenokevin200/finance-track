import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Landmark } from 'lucide-react';
import { AccountInput } from '@/services/firefly';

interface BankingFieldsProps {
    formData: AccountInput;
    setFormData: (data: AccountInput) => void;
}

export const BankingFields: React.FC<BankingFieldsProps> = ({ formData, setFormData }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <CreditCard className="h-3.5 w-3.5" /> Uso de la Cuenta
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('accounts.account_role')}
                    </label>
                    <select
                        value={formData.account_role}
                        onChange={(e) => setFormData({ ...formData, account_role: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="defaultAsset">{t('accounts.roles.defaultAsset')}</option>
                        <option value="savingsAsset">{t('accounts.roles.savingsAsset')}</option>
                        <option value="sharedAsset">{t('accounts.roles.sharedAsset') || 'Cuenta Compartida'}</option>
                        <option value="ccAsset">{t('accounts.roles.ccAsset') || 'Tarjeta de Crédito'}</option>
                        <option value="cashWalletAsset">{t('accounts.roles.cashWalletAsset')}</option>
                    </select>
                </div>
                
                {formData.account_role === 'ccAsset' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-xl">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Día de Corte</label>
                            <select
                                value={formData.cc_closing_day || ''}
                                onChange={(e) => setFormData({ ...formData, cc_closing_day: e.target.value })}
                                className="w-full rounded-xl border border-orange-200 px-4 py-2.5 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">No configurado</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                    <option key={`close-${day}`} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Día de Pago</label>
                            <select
                                value={formData.cc_payment_day || ''}
                                onChange={(e) => setFormData({ ...formData, cc_payment_day: e.target.value })}
                                className="w-full rounded-xl border border-orange-200 px-4 py-2.5 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">No configurado</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                    <option key={`pay-${day}`} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <Landmark className="h-3.5 w-3.5" /> Datos Bancarios
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('accounts.account_number')}</label>
                        <input
                            type="text"
                            value={formData.account_number || ''}
                            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('accounts.iban')}</label>
                        <input
                            type="text"
                            value={formData.iban || ''}
                            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

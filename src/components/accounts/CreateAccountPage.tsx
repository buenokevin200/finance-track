import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, BadgeDollarSign, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { fireflyService } from '@/services/firefly';
import { useAccountForm } from './form/useAccountForm';
import { BasicFields } from './form/BasicFields';
import { BankingFields } from './form/BankingFields';
import { LiabilityFields } from './form/LiabilityFields';

export const CreateAccountPage: React.FC = () => {
    const navigate = useNavigate();
    const { formData, setFormData, config, t } = useAccountForm();
    const [loading, setLoading] = useState(false);
    const [currencies, setCurrencies] = useState<any[]>([]);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const curData = await fireflyService.getCurrencies();
                setCurrencies(curData.data || []);
            } catch (error) {
                console.error('Error fetching currencies:', error);
            }
        };
        fetchCurrencies();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submissionData = { ...formData };
            if (submissionData.type === 'liabilities') {
                submissionData.liability_amount = submissionData.opening_balance;
            }
            await fireflyService.createAccount(submissionData);
            navigate('/accounts');
        } catch (error) {
            console.error('Error creating account:', error);
        } finally {
            setLoading(false);
        }
    };

    const currencySymbol = currencies.find(c => c.attributes.code === formData.currency_code)?.attributes.symbol || '$';

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Navigation Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/accounts')}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${config.accentClass}`}>
                                <config.Icon className="h-6 w-6" />
                            </div>
                            {config.titleKey}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Completa los detalles para configurar tu nueva cuenta
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => navigate('/accounts')} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        isLoading={loading}
                        className={`${config.btnClass} text-white shadow-lg shadow-current/10`}
                    >
                        {t('accounts.new')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <form id="account-form" onSubmit={handleSubmit} className="lg:col-span-2 space-y-8 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    
                    <BasicFields formData={formData} setFormData={setFormData} currencies={currencies} />

                    {config.isAsset && <BankingFields formData={formData} setFormData={setFormData} />}

                    {(config.isAsset || config.isLiability) && (
                        <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                <BadgeDollarSign className="h-3.5 w-3.5" /> Balance Inicial
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {config.isLiability ? t('accounts.liability_amount') : t('accounts.opening_balance')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currencySymbol}</div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.opening_balance}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
                                            className="w-full rounded-xl border border-gray-300 pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {config.isLiability ? 'Fecha de inicio' : t('accounts.opening_balance_date')}
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.opening_balance_date}
                                        onChange={(e) => setFormData({ ...formData, opening_balance_date: e.target.value })}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {config.isLiability && <LiabilityFields formData={formData} setFormData={setFormData} />}

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                            <FileText className="h-3.5 w-3.5" /> Información Adicional
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('accounts.notes')}</label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                                placeholder="Añade detalles adicionales o recordatorios..."
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{t('accounts.active_label')}</span>
                            </label>
                        </div>
                    </div>
                </form>

                {/* Info / Preview Sticky Column */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <config.Icon className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <p className="text-xs font-bold text-blue-100 uppercase tracking-widest opacity-80">Vista Previa</p>
                            <div>
                                <h3 className="text-xl font-bold truncate">
                                    {formData.name || 'Nombre de la Cuenta'}
                                </h3>
                                <p className="text-xs text-blue-100 mt-1 opacity-70">
                                    {config.isAsset ? t(`accounts.roles.${formData.account_role}`) : t(`accounts.${formData.type}_accounts`)}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-xs text-blue-100 uppercase opacity-60">Balance Estimado</p>
                                <p className="text-2xl font-black">
                                    {currencySymbol} {parseFloat(formData.opening_balance || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-5 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                            <Info className="h-4 w-4" /> Tip de Ahorro
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
                            Configurar correctamente el balance inicial es clave para que tus reportes mensuales sean exactos desde el primer día.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Info, FileText } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { fireflyService, AccountInput } from '@/services/firefly';
import { useAccountForm } from './form/useAccountForm';
import { BasicFields } from './form/BasicFields';
import { BankingFields } from './form/BankingFields';
import { LiabilityFields } from './form/LiabilityFields';

export const EditAccountPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState<AccountInput | undefined>(undefined);
    const { formData, setFormData, config, t } = useAccountForm(initialData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currencies, setCurrencies] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [accData, curData] = await Promise.all([
                    fireflyService.getAccount(id),
                    fireflyService.getCurrencies()
                ]);
                
                const attr = accData.data.attributes;
                setInitialData({
                    name: attr.name,
                    type: attr.type,
                    currency_code: attr.currency_code,
                    active: attr.active,
                    iban: attr.iban,
                    bic: attr.bic,
                    account_number: attr.account_number,
                    account_role: attr.account_role,
                    notes: '', // Notes might not be in basic attributes
                    virtual_balance: '',
                });
                setCurrencies(curData.data || []);
            } catch (error) {
                console.error('Error fetching account for edit:', error);
                navigate('/accounts');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            await fireflyService.updateAccount(id, formData);
            navigate(`/accounts/${id}`);
        } catch (error) {
            console.error('Error updating account:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Navigation Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${config.accentClass}`}>
                                <config.Icon className="h-6 w-6" />
                            </div>
                            Editar Cuenta: {initialData?.name}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Modifica los detalles de tu cuenta bancaria o de gastos
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => navigate(-1)} disabled={saving}>
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        isLoading={saving}
                        className={`${config.btnClass} text-white shadow-lg shadow-current/10`}
                    >
                        {t('common.save')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <form id="edit-account-form" onSubmit={handleSubmit} className="lg:col-span-2 space-y-8 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    
                    <BasicFields formData={formData} setFormData={setFormData} currencies={currencies} />

                    {config.isAsset && <BankingFields formData={formData} setFormData={setFormData} />}

                    {config.isLiability && <LiabilityFields formData={formData} setFormData={setFormData} />}

                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
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

                {/* Info Box */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                        <h3 className="font-bold text-gray-900 dark:text-white">Consejo de Edición</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                            "Si cambias el nombre de la cuenta, todas tus transacciones pasadas reflejarán el nuevo nombre automáticamente."
                        </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-5 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
                            <Info className="h-4 w-4" /> Importante
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-500 leading-relaxed">
                            No puedes cambiar el tipo principal de una cuenta (Activo a Pasivo) una vez creada para mantener la integridad de tus reportes históricos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

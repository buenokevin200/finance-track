import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ChevronLeft, Calendar, BadgeDollarSign, Building, Percent } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { fireflyService, AccountInput } from '@/services/firefly';
import { toast } from 'sonner';

export const CreditCardForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currencies, setCurrencies] = useState<any[]>([]);

    const [formData, setFormData] = useState<AccountInput>({
        name: '',
        type: 'liabilities',
        liability_type: 'debt',
        liability_direction: 'credit',
        currency_code: 'USD',
        active: true,
        virtual_balance: '',
        interest: '0',
        interest_period: 'monthly',
        cc_closing_day: '',
        cc_payment_day: '',
        is_cc: true,
        notes: ''
    });

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

    const handleCancel = () => {
        navigate('/credit-cards');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submissionData = { ...formData, opening_balance: '0', liability_amount: '0' };
            await fireflyService.createAccount(submissionData);
            toast.success('Tarjeta configurada correctamente');
            navigate('/credit-cards');
        } catch (error) {
            console.error('Error creating credit card:', error);
            toast.error('Error al crear la tarjeta');
        } finally {
            setLoading(false);
        }
    };

    const currencySymbol = currencies.find((c: any) => c.attributes.code === formData.currency_code)?.attributes.symbol || '$';

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleCancel}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <CreditCard className="h-6 w-6 text-indigo-500" />
                            Configurar Nueva Tarjeta
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Registra los parámetros exactos de tu tarjeta de crédito.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                
                {/* Bloque: Identificación */}
                <div className="space-y-4">
                    <h3 className="font-bold border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <Building className="w-4 h-4" /> Entidad y Moneda
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre de la Tarjeta</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Visa Platinum"
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Moneda a facturar</label>
                            <select
                                required
                                value={formData.currency_code}
                                onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all"
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

                {/* Bloque: Límites y Responsabilidad */}
                <div className="space-y-4 pt-4">
                    <h3 className="font-bold border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2 text-rose-600 dark:text-rose-400">
                        <BadgeDollarSign className="w-4 h-4" /> Límites e Intereses (TNA)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5 md:col-span-1 border-r border-gray-100 dark:border-gray-700 pr-4">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Límite de Crédito</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currencySymbol}</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.virtual_balance}
                                    onChange={(e) => setFormData({ ...formData, virtual_balance: e.target.value })}
                                    placeholder="Ej: 5000"
                                    className="w-full rounded-xl border border-gray-300 pl-8 pr-4 py-2.5 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                Interés <Percent className="w-3 h-3" />
                            </label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={formData.interest}
                                onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Período de Interés</label>
                            <select
                                required
                                value={formData.interest_period}
                                onChange={(e) => setFormData({ ...formData, interest_period: e.target.value as any })}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="monthly">Mensual</option>
                                <option value="yearly">Anual (TNA)</option>
                                <option value="weekly">Semanal</option>
                                <option value="daily">Diario</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bloque: Fechas Vitales */}
                <div className="space-y-4 pt-4">
                    <h3 className="font-bold border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <Calendar className="w-4 h-4" /> Fechas de Ciclo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Día de Corte</label>
                            <select
                                required
                                value={formData.cc_closing_day}
                                onChange={(e) => setFormData({ ...formData, cc_closing_day: e.target.value })}
                                className="w-full rounded-xl border border-emerald-200 px-4 py-2.5 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Selecciona el día (Ej: 15)</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                    <option key={`close-${day}`} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Día Límite de Pago</label>
                            <select
                                required
                                value={formData.cc_payment_day}
                                onChange={(e) => setFormData({ ...formData, cc_payment_day: e.target.value })}
                                className="w-full rounded-xl border border-emerald-200 px-4 py-2.5 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Selecciona el día (Ej: 30)</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                    <option key={`pay-${day}`} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 mt-8">
                    <Button type="button" variant="ghost" onClick={handleCancel} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 px-8">
                        Crear Tarjeta
                    </Button>
                </div>
            </form>
        </div>
    );
};

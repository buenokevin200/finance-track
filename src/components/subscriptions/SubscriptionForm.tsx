import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Wallet } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { fireflyService, Account } from '@/services/firefly';
import { toast } from 'sonner';

interface SubscriptionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    // Form logic
    const [isFixed, setIsFixed] = useState(true);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [amountMin, setAmountMin] = useState('');
    const [amountMax, setAmountMax] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [repeatFreq, setRepeatFreq] = useState<'weekly' | 'monthly' | 'quarterly' | 'half-year' | 'yearly'>('monthly');
    const [assetAccountId, setAssetAccountId] = useState('');
    
    const [assetAccounts, setAssetAccounts] = useState<Account[]>([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await fireflyService.getAccounts('asset');
                setAssetAccounts(res.data || []);
            } catch (error) {
                console.error('Failed to load accounts for subscriptions', error);
            }
        };
        if (isOpen) {
            fetchAccounts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            const attrs = initialData.attributes;
            setName(attrs.name || '');
            setDate(attrs.date ? new Date(attrs.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setRepeatFreq((attrs.repeat_freq as any) || 'monthly');
            setAmountMin(attrs.amount_min || '');
            setAmountMax(attrs.amount_max || '');
            
            if (attrs.amount_min === attrs.amount_max) {
                setIsFixed(true);
                setAmount(attrs.amount_min);
            } else {
                setIsFixed(false);
            }

            // Extract asset account id from notes if present
            if (attrs.notes && attrs.notes.startsWith('asset_account_id:')) {
                setAssetAccountId(attrs.notes.split(':')[1]);
            } else {
                setAssetAccountId('');
            }
        } else {
            // Reset
            setName('');
            setAmount('');
            setAmountMin('');
            setAmountMax('');
            setDate(new Date().toISOString().split('T')[0]);
            setRepeatFreq('monthly');
            setAssetAccountId('');
            setIsFixed(true);
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name,
            date,
            repeat_freq: repeatFreq,
            amount_min: isFixed ? amount : amountMin,
            amount_max: isFixed ? amount : amountMax,
            asset_account_id: assetAccountId
        };

        try {
            await onSubmit(payload);
            toast.success(initialData ? 'Suscripción actualizada exitosamente' : 'Suscripción creada exitosamente');
            onClose();
        } catch (error) {
            console.error('Error saving subscription', error);
            toast.error('Ocurrió un error al guardar');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 animate-in zoom-in-95 duration-200">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {initialData ? 'Editar Suscripción' : 'Nueva Suscripción'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Configura tus gastos recurrentes</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Servicio / Descripción
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="Ej. Netflix, Gimnasio, Luz..."
                        />
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-xl">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">¿El monto es fijo?</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Desactiva si el cobro varía (ej. Luz, Agua)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isFixed}
                                onChange={(e) => setIsFixed(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Cost Inputs */}
                    {isFixed ? (
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Monto Fijo</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono"
                                placeholder="0.00"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Monto Mínimo</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={amountMin}
                                    onChange={(e) => setAmountMin(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Monto Máximo</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={amountMax}
                                    onChange={(e) => setAmountMax(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-gray-500" /> Próximo Cobro
                            </label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Frecuencia</label>
                            <select
                                value={repeatFreq}
                                onChange={(e) => setRepeatFreq(e.target.value as any)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensual</option>
                                <option value="quarterly">Trimestral</option>
                                <option value="half-year">Semestral</option>
                                <option value="yearly">Anual</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Wallet className="h-4 w-4 text-gray-500" /> Cuenta de Pago por Defecto
                        </label>
                        <select
                            value={assetAccountId}
                            required
                            onChange={(e) => setAssetAccountId(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Seleccionar cuenta...</option>
                            {assetAccounts.map(a => (
                                <option key={a.id} value={a.id}>{a.attributes.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 mt-8">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            Guardar Suscripción
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { Play, TrendingUp, Calendar as CalIcon, CreditCard, ChevronRight, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { fireflyService, Subscription } from '@/services/firefly';
import { SubscriptionForm } from './SubscriptionForm';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { toast } from 'sonner';

export const Subscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [txInitialData, setTxInitialData] = useState<any>(null);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const res = await fireflyService.getSubscriptions();
            const list: Subscription[] = res.data || [];
            setSubscriptions(list);

            // Analizar suscripciones vencidas
            const today = new Date();
            const overdue = list.filter(sub => {
                const target = new Date(sub.attributes.date);
                return sub.attributes.active && target.getTime() < today.getTime() && sub.attributes.date !== today.toISOString().split('T')[0];
            });

            if (overdue.length > 0) {
                toast.warning(`Tienes ${overdue.length} suscripciones vencidas sin registrar.`);
            }

        } catch (error) {
            console.error('Failed to load subscriptions', error);
            toast.error('Error al cargar la lista de suscripciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleCreate = () => {
        setSelectedSub(null);
        setIsSubModalOpen(true);
    };

    const handleEdit = (sub: Subscription) => {
        setSelectedSub(sub);
        setIsSubModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await fireflyService.deleteSubscription(deleteId);
            toast.success('Suscripción cancelada permanentemente.');
            fetchSubscriptions();
        } catch (error) {
            toast.error('Error al intentar eliminar la suscripción');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const handleSubSubmit = async (data: any) => {
        if (selectedSub) {
            await fireflyService.updateSubscription(selectedSub.id, data);
        } else {
            await fireflyService.createSubscription(data);
        }
        fetchSubscriptions();
    };

    const handleConvertToTx = (sub: Subscription) => {
        let sourceId = '';
        if (sub.attributes.notes && sub.attributes.notes.startsWith('asset_account_id:')) {
            sourceId = sub.attributes.notes.split(':')[1];
        }

        const data = {
            attributes: {
                type: 'withdrawal',
                description: sub.attributes.name,
                amount: sub.attributes.amount_max,
                date: sub.attributes.date,
                source_id: sourceId,
                destination_name: sub.attributes.name,
            }
        };

        setTxInitialData(data);
        setIsTxModalOpen(true);
    };

    const handleTxSubmit = async (data: any) => {
        // En una app real de firefly, hacer esto probablemente debería adelantar la fecha del "Bill" original
        // Pero aquí lo delegamos a la sincronización manual por ahora o Firefly III lo hace automáticamente por regla
        await fireflyService.createTransaction(data);
        toast.success('Registro existoso de la transacción.');
        // Refresh
        setTimeout(() => fetchSubscriptions(), 1500); 
    };

    const getDaysRemaining = (dateStr: string) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const target = new Date(dateStr);
        target.setHours(0,0,0,0);
        const diff = target.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const totalFixedMonthly = subscriptions
        .filter(s => s.attributes.active)
        .reduce((sum, s) => {
            // Un cálculo aproximado rápido mensual (todo lo que sea weekly x4, etc)
            let multiplier = 1;
            if (s.attributes.repeat_freq === 'weekly') multiplier = 4;
            if (s.attributes.repeat_freq === 'yearly') multiplier = 1/12;
            if (s.attributes.repeat_freq === 'quarterly') multiplier = 1/3;
            
            return sum + (parseFloat(s.attributes.amount_max) * multiplier);
        }, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Suscripciones</h1>
                    <p className="text-gray-500 mt-1 dark:text-gray-400">Control de gastos fijos y servicios recurrentes.</p>
                </div>
                <Button onClick={handleCreate} className="shadow-lg shadow-blue-500/20 rounded-full px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Suscripción
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-2 mb-4 opacity-90">
                            <TrendingUp className="w-5 h-5" />
                            <h3 className="font-medium text-sm tracking-wide">Gasto Fijo Mensual</h3>
                        </div>
                        <div>
                            <p className="text-3xl font-black tracking-tighter">
                                ${totalFixedMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs opacity-70 mt-1">Compromiso total recurrente del mes activo</p>
                        </div>
                    </div>
                    <CreditCard className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Próximos Vencimientos</h3>
                
                {loading ? (
                    <div className="py-20 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>
                ) : subscriptions.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <CalIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-gray-900 dark:text-white font-medium">No hay suscripciones</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Vincula tus pagos de Netflix, Gimnasio, o Internet para llevar el rastreo.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {subscriptions
                            .sort((a, b) => new Date(a.attributes.date).getTime() - new Date(b.attributes.date).getTime())
                            .map((sub) => {
                            
                            const days = getDaysRemaining(sub.attributes.date);
                            const isOverdue = days < 0;
                            const isSoon = days >= 0 && days <= 5;
                            const isFixed = sub.attributes.amount_min === sub.attributes.amount_max;

                            let statusColor = "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
                            let statusText = `En ${days} días`;
                            if (isOverdue) {
                                statusColor = "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
                                statusText = `Hace ${Math.abs(days)} días`;
                            } else if (days === 0) {
                                statusColor = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
                                statusText = "¡Hoy!";
                            } else if (isSoon) {
                                statusColor = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
                            }

                            return (
                                <div key={sub.id} className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-default">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl shadow-inner uppercase">
                                                {sub.attributes.name.substring(0, 2)}
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest ${statusColor}`}>
                                                {isOverdue && <AlertCircle className="w-3 h-3" />}
                                                {statusText}
                                            </div>
                                        </div>
                                        
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate pr-4" title={sub.attributes.name}>
                                            {sub.attributes.name}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1.5 mt-1">
                                            <CalIcon className="w-3.5 h-3.5" /> 
                                            {new Date(sub.attributes.date).toLocaleDateString()}
                                            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1 bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                {sub.attributes.repeat_freq}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-5 border-t border-gray-50 dark:border-gray-700 flex items-end justify-between relative overflow-hidden">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Monto {isFixed ? 'Fijo' : 'Esperado'}</p>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                                ${parseFloat(sub.attributes.amount_max).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>

                                        <div className="absolute right-0 bottom-0 translate-y-10 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1 bg-white dark:bg-gray-800 pl-4 py-1">
                                            <button onClick={() => handleEdit(sub)} className="p-2 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Editar">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(sub.id)} className="p-2 rounded-full text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="Eliminar">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleConvertToTx(sub)}
                                            className="group/btn relative w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:w-32 hover:bg-blue-700 transition-all duration-300 right-0 group-hover:-translate-y-12"
                                            title="Convertir a Transacción"
                                        >
                                            <Play className="w-4 h-4 absolute group-hover/btn:opacity-0 transition-opacity" />
                                            <span className="opacity-0 group-hover/btn:opacity-100 whitespace-nowrap text-xs font-bold transition-opacity">
                                                Registrar Pago
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <SubscriptionForm
                isOpen={isSubModalOpen}
                onClose={() => setIsSubModalOpen(false)}
                onSubmit={handleSubSubmit}
                initialData={selectedSub}
            />

            <TransactionModal
                isOpen={isTxModalOpen}
                onClose={() => setIsTxModalOpen(false)}
                onSubmit={handleTxSubmit}
                initialData={txInitialData}
            />

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Suscripción"
                message="¿Estás seguro de que deseas desconectar este gasto recurrente? Las transacciones previas se mantendrán intactas en tu registro."
                confirmText="Sí, Eliminar"
                cancelText="Mantener"
                isLoading={isDeleting}
            />

        </div>
    );
};

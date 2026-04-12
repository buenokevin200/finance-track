import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, ArrowRight, AlertCircle, Calendar, Wallet } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { fireflyService, Account } from '@/services/firefly';
import { parseAccountNotes, calculateNextCutDate, calculateNextPaymentDate } from '@/utils/cardUtils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const CreditCards: React.FC = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const [assetRes, liabRes] = await Promise.all([
                    fireflyService.getAccounts('asset'),
                    fireflyService.getAccounts('liabilities')
                ]);
                const ccAccounts = [
                    ...assetRes.data.filter((a: Account) => a.attributes.account_role === 'ccAsset'),
                    ...liabRes.data.filter((a: Account) => a.attributes.liability_type === 'credit_card')
                ];
                setCards(ccAccounts);
            } catch (error) {
                console.error('Error fetching cards:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCards();
    }, []);

    const totalDebt = cards.reduce((acc, card) => {
        const bal = parseFloat(card.attributes.current_balance);
        return acc + (bal < 0 ? Math.abs(bal) : 0);
    }, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-indigo-500" />
                        Tarjetas de Crédito
                    </h1>
                    <p className="text-gray-500 mt-2">Controla tus fechas de corte, límites y pagos sin perder el hilo.</p>
                </div>
                <Button onClick={() => navigate('/credit-cards/new')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Nueva Tarjeta
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Deuda Total Consolidada</p>
                    <p className="text-3xl font-black text-rose-600">${totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="h-8 w-8" />
                </div>
            </div>

            {loading ? (
                <div className="flex py-20 justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                </div>
            ) : cards.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <CreditCard className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold dark:text-white">Sin Tarjetas Configuradas</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">No tienes cuentas con el rol "Tarjeta de Crédito". Toca el botón de Nueva Tarjeta para construir tu primer plástico virtual.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cards.map((card, index) => {
                        const { attributes } = card;
                        let daysToCut: number | null = null;
                        let nextCutDate: Date | null = null;
                        let nextPayDate: Date | null = null;
                        let hasConfig = false;

                        if (attributes.notes) {
                            const { closing_day, payment_day } = parseAccountNotes(attributes.notes);
                            if (closing_day) {
                                hasConfig = true;
                                nextCutDate = calculateNextCutDate(closing_day);
                                if (nextCutDate) {
                                    const today = new Date();
                                    today.setHours(0,0,0,0);
                                    daysToCut = Math.ceil((nextCutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    if (payment_day) {
                                        nextPayDate = calculateNextPaymentDate(payment_day, nextCutDate);
                                    }
                                }
                            }
                        }

                        const balance = parseFloat(attributes.current_balance);
                        const strBalance = Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2 });
                        
                        let cutBadgeClass = 'bg-blue-500/20 text-blue-100';
                        if (daysToCut !== null) {
                            if (daysToCut <= 2) {
                                cutBadgeClass = 'bg-red-500/30 text-white font-bold border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse';
                            } else if (daysToCut <= 5) {
                                cutBadgeClass = 'bg-orange-500/30 text-orange-50 border border-orange-500/50 font-bold';
                            }
                        }

                        // Algoritmo visual para rotar gradientes bancarios elegantes pseudo-aleatoriamente
                        const bgGradient = index % 3 === 0 ? 'from-slate-800 to-zinc-950' 
                                            : index % 3 === 1 ? 'from-blue-900 to-slate-900'
                                            : 'from-violet-900 to-indigo-950';

                        return (
                            <div key={card.id} className={`group relative bg-gradient-to-br ${bgGradient} text-white p-6 rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 border border-white/10`}>
                                {/* Abstract Visa-style light glares */}
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white opacity-[0.03] mix-blend-overlay"></div>
                                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-white opacity-[0.03] mix-blend-overlay"></div>
                                
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="flex-1 pr-4 whitespace-nowrap overflow-hidden">
                                        <h3 className="font-bold text-lg leading-tight truncate">{attributes.name}</h3>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">Línea de Crédito</p>
                                    </div>
                                    <div className="w-12 h-8 rounded bg-gradient-to-tr from-amber-300 to-amber-100 flex flex-col justify-center px-1.5 opacity-90">
                                        <div className="w-full h-px bg-black/20 mb-1"></div>
                                        <div className="w-full h-px bg-black/20"></div>
                                    </div>
                                </div>

                                <div className="mb-8 relative z-10">
                                    <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Deuda Consumida</p>
                                    <h2 className="text-3xl font-black font-mono tracking-tight">
                                        {attributes.currency_symbol} {strBalance}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                                    <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-inner">
                                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/50 mb-2">
                                            <Calendar className="w-3 h-3 text-blue-400" /> Próximo Corte
                                        </div>
                                        {hasConfig && daysToCut !== null ? (
                                            <div>
                                                <p className="font-bold text-sm tracking-wide">{nextCutDate ? format(nextCutDate, 'dd MMM', {locale: es}) : 'Error'}</p>
                                                <div className={`mt-2 px-2.5 py-1 rounded-md text-[10px] inline-flex items-center justify-center w-full ${cutBadgeClass}`}>
                                                    {daysToCut === 0 ? '¡Corta Hoy!' : daysToCut === 1 ? '¡Mañana!' : `En ${daysToCut} días`}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-white/30 italic uppercase border border-dashed border-white/20 p-2 rounded text-center">Sin Configurar</p>
                                        )}
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-inner">
                                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/50 mb-2">
                                            <Wallet className="w-3 h-3 text-emerald-400" /> Fecha Límite
                                        </div>
                                        {hasConfig && nextPayDate ? (
                                            <div>
                                                <p className="font-bold text-sm text-emerald-300 tracking-wide">{format(nextPayDate, 'dd MMM', {locale: es})}</p>
                                                <p className="text-[10px] text-white/40 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Evita recargos</p>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-white/30 italic uppercase border border-dashed border-white/20 p-2 rounded text-center">Sin Configurar</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="pt-5 border-t border-white/10 flex justify-between items-center relative z-10">
                                    <button 
                                        onClick={() => navigate(`/accounts/${card.id}`)}
                                        className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-indigo-300 flex items-center gap-2 transition-colors cursor-pointer w-full justify-between"
                                    >
                                        Ver Transacciones <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

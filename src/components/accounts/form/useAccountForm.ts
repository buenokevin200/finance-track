import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Landmark, CreditCard, Banknote, ShieldQuestion, PiggyBank, Receipt } from 'lucide-react';
import { AccountInput } from '@/services/firefly';

export const useAccountForm = (initialData?: AccountInput) => {
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
        }
    }, [initialData]);

    const config = useMemo(() => {
        const type = formData.type;
        const role = formData.account_role;
        
        const isAsset = type === 'asset';
        const isLiability = type === 'liabilities';
        const isExpense = type === 'expense';
        const isRevenue = type === 'revenue';
        
        let Icon = Wallet;
        let accentClass = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30';
        let btnClass = 'bg-blue-600 hover:bg-blue-700';
        let titleKey = 'accounts.new';

        if (isAsset) {
            Icon = role === 'savingsAsset' ? PiggyBank : role === 'sharedAsset' ? CreditCard : Landmark;
            titleKey = 'Nueva Cuenta Bancaria';
            accentClass = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30';
            btnClass = 'bg-blue-600 hover:bg-blue-700';
        } else if (isExpense) {
            Icon = Receipt;
            titleKey = 'Nueva Cuenta de Gastos';
            accentClass = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30';
            btnClass = 'bg-rose-600 hover:bg-rose-700';
        } else if (isRevenue) {
            Icon = Banknote;
            titleKey = 'Nueva Cuenta de Ingresos';
            accentClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30';
            btnClass = 'bg-emerald-600 hover:bg-emerald-700';
        } else if (isLiability) {
            Icon = ShieldQuestion;
            titleKey = 'Nuevo Pasivo / Deuda';
            accentClass = 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/30';
            btnClass = 'bg-slate-700 hover:bg-slate-800';
        }

        return { isAsset, isLiability, isExpense, isRevenue, Icon, accentClass, btnClass, titleKey };
    }, [formData.type, formData.account_role]);

    return {
        formData,
        setFormData,
        config,
        t
    };
};

import api from './api';
import { Account, AccountInput } from './types';
import { packCutoffDay } from '@/utils/cardUtils';

export const accountsService = {
    getAccounts: async (type: 'asset' | 'expense' | 'revenue' | 'liabilities' | 'all' = 'asset') => {
        if (type === 'all') {
            const types = ['asset', 'expense', 'revenue', 'liabilities'];
            const results = await Promise.all(types.map(t => api.get(`/accounts?type=${t}`)));
            return {
                data: results.flatMap((r: any) => r.data.data)
            };
        }
        const response = await api.get(`/accounts?type=${type}`);
        return response.data;
    },

    getAccount: async (id: string) => {
        const response = await api.get(`/accounts/${id}`);
        return response.data;
    },

    createAccount: async (data: AccountInput) => {
        let rawNotes = data.notes || '';
        if (data.is_cc) {
            rawNotes = packCutoffDay(rawNotes, data.cc_closing_day || '');
        }

        const payload: any = {
            name: data.name,
            type: data.type,
            currency_code: data.currency_code,
            active: data.active,
            notes: rawNotes || null,
        };

        if (data.iban) payload.iban = data.iban;
        if (data.bic) payload.bic = data.bic;
        if (data.account_number) payload.account_number = data.account_number;

        if (data.type === 'asset') {
            payload.account_role = data.account_role;
            payload.opening_balance = data.opening_balance;
            payload.opening_balance_date = data.opening_balance_date;
            if (data.is_cc) {
                // Firefly exige una FECHA real, no solo el día
                if (data.monthly_payment_date) {
                    const today = new Date();
                    const day = parseInt(data.monthly_payment_date, 10);
                    const payDate = new Date(today.getFullYear(), today.getMonth(), day);
                    // Si el día ya pasó, ponerlo para el mes siguiente
                    if (payDate < today) payDate.setMonth(payDate.getMonth() + 1);
                    payload.monthly_payment_date = payDate.toISOString().split('T')[0];
                }
                payload.credit_limit = data.credit_limit;
                payload.credit_card_type = data.credit_card_type || 'visa';
            }
        } else if (data.type === 'liabilities') {
            payload.liability_type = data.liability_type;
            payload.liability_direction = data.liability_direction;
            payload.interest = data.interest;
            payload.interest_period = data.interest_period;
            
            const liabAmount = data.liability_amount || data.opening_balance;
            if (liabAmount && liabAmount !== '0') {
                payload.liability_amount = liabAmount;
                payload.opening_balance = liabAmount;
                payload.liability_start_date = data.opening_balance_date;
                payload.opening_balance_date = data.opening_balance_date;
            }
        }

        const response = await api.post('/accounts', payload);
        return response.data;
    },

    updateAccount: async (id: string, data: AccountInput) => {
        let rawNotes = data.notes || '';
        if (data.is_cc) {
            rawNotes = packCutoffDay(rawNotes, data.cc_closing_day || '');
        }

        const payload: any = {
            name: data.name,
            active: data.active,
            notes: rawNotes || null,
        };

        if (data.iban) payload.iban = data.iban;
        if (data.bic) payload.bic = data.bic;
        if (data.account_number) payload.account_number = data.account_number;

        if (data.type === 'liabilities') {
            payload.liability_type = data.liability_type;
            payload.liability_direction = data.liability_direction;
            payload.interest = data.interest;
            payload.interest_period = data.interest_period;
        } else if (data.type === 'asset') {
            payload.account_role = data.account_role;
            if (data.is_cc) {
                if (data.monthly_payment_date) {
                    const today = new Date();
                    const day = parseInt(data.monthly_payment_date, 10);
                    const payDate = new Date(today.getFullYear(), today.getMonth(), day);
                    if (payDate < today) payDate.setMonth(payDate.getMonth() + 1);
                    payload.monthly_payment_date = payDate.toISOString().split('T')[0];
                }
                payload.credit_limit = data.credit_limit;
                payload.credit_card_type = data.credit_card_type || 'visa';
            }
        }

        const response = await api.put(`/accounts/${id}`, payload);
        return response.data;
    },

    deleteAccount: async (id: string) => {
        await api.delete(`/accounts/${id}`);
    },

    searchAccounts: async (query: string, type: 'asset' | 'expense' | 'revenue') => {
        const accounts = await accountsService.getAccounts(type);
        return accounts.data.filter((a: Account) => a.attributes.name.toLowerCase().includes(query.toLowerCase()));
    }
};

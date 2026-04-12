import api from './api';
import { Account, AccountInput } from './types';
import { packAccountNotes } from '@/utils/cardUtils';

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
        if ((data.type === 'asset' && data.account_role === 'ccAsset') || data.is_cc) {
            rawNotes = packAccountNotes(rawNotes, data.cc_closing_day || '', data.cc_payment_day || '', data.is_cc || false);
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
        } else if (data.type === 'liabilities') {
            payload.liability_type = data.liability_type;
            payload.liability_amount = data.liability_amount || data.opening_balance;
            payload.liability_direction = data.liability_direction;
            payload.interest = data.interest;
            payload.interest_period = data.interest_period;
            if (data.virtual_balance) payload.virtual_balance = data.virtual_balance;
            payload.liability_start_date = data.opening_balance_date;
            payload.opening_balance = data.opening_balance || data.liability_amount;
            payload.opening_balance_date = data.opening_balance_date;
        }

        const response = await api.post('/accounts', payload);
        return response.data;
    },

    updateAccount: async (id: string, data: AccountInput) => {
        let rawNotes = data.notes || '';
        if ((data.type === 'asset' && data.account_role === 'ccAsset') || data.is_cc) {
            rawNotes = packAccountNotes(rawNotes, data.cc_closing_day || '', data.cc_payment_day || '', data.is_cc || false);
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
            if (data.virtual_balance) payload.virtual_balance = data.virtual_balance;
        } else if (data.type === 'asset') {
            payload.account_role = data.account_role;
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

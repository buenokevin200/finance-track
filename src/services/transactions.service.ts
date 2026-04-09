import api from './api';
import { TransactionInput } from './types';

const flattenTransaction = (item: any) => {
    const split = item.attributes.transactions[0];
    return {
        id: item.id,
        attributes: {
            created_at: item.attributes.created_at,
            date: split.date,
            description: split.description,
            amount: split.amount,
            currency_symbol: split.currency_symbol,
            currency_code: split.currency_code,
            type: split.type,
            source_name: split.source_name,
            source_id: split.source_id,
            destination_name: split.destination_name,
            destination_id: split.destination_id,
            category_name: split.category_name,
            category_id: split.category_id,
        }
    };
};

export const transactionsService = {
    getTransactions: async (page = 1, type?: 'withdrawal' | 'deposit' | 'transfer', start?: string, end?: string) => {
        let url = `/transactions?page=${page}`;
        if (type) url += `&type=${type}`;
        if (start && end) {
            url += `&start=${start}&end=${end}`;
        }
        const response = await api.get(url);
        return {
            ...response.data,
            data: response.data.data.map(flattenTransaction)
        };
    },

    createTransaction: async (data: TransactionInput) => {
        const payload = {
            transactions: [data]
        };
        const response = await api.post('/transactions', payload);
        return response.data;
    },

    updateTransaction: async (id: string, data: TransactionInput) => {
        const payload = {
            transactions: [data]
        };
        const response = await api.put(`/transactions/${id}`, payload);
        return response.data;
    },

    deleteTransaction: async (id: string) => {
        await api.delete(`/transactions/${id}`);
    },

    getAccountTransactions: async (id: string, page = 1) => {
        const response = await api.get(`/accounts/${id}/transactions?page=${page}`);
        return {
            ...response.data,
            data: response.data.data.map(flattenTransaction)
        };
    }
};

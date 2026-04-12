import api from './api';
import { SubscriptionInput } from './types';

export const subscriptionsService = {
    getSubscriptions: async () => {
        const response = await api.get('/bills');
        return response.data;
    },

    getSubscription: async (id: string) => {
        const response = await api.get(`/bills/${id}`);
        return response.data;
    },

    createSubscription: async (data: SubscriptionInput) => {
        const payload = {
            name: data.name,
            amount_min: data.amount_min,
            amount_max: data.amount_max,
            date: data.date,
            repeat_freq: data.repeat_freq,
            notes: data.asset_account_id ? `asset_account_id:${data.asset_account_id}` : data.notes,
            active: true
        };
        const response = await api.post('/bills', payload);
        return response.data;
    },

    updateSubscription: async (id: string, data: SubscriptionInput) => {
        const payload: any = {
            name: data.name,
            amount_min: data.amount_min,
            amount_max: data.amount_max,
            date: data.date,
            repeat_freq: data.repeat_freq,
        };
        
        if (data.asset_account_id) {
            payload.notes = `asset_account_id:${data.asset_account_id}`;
        } else if (data.notes) {
            payload.notes = data.notes;
        }

        const response = await api.put(`/bills/${id}`, payload);
        return response.data;
    },

    deleteSubscription: async (id: string) => {
        await api.delete(`/bills/${id}`);
    }
};

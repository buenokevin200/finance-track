import api from './api';
import { CurrencyInput } from './types';

export const currenciesService = {
    getCurrencies: async () => {
        const response = await api.get('/currencies');
        return response.data;
    },

    createCurrency: async (data: CurrencyInput) => {
        const response = await api.post('/currencies', data);
        return response.data;
    },

    updateCurrency: async (code: string, data: CurrencyInput) => {
        const response = await api.put(`/currencies/${code}`, data);
        return response.data;
    },

    deleteCurrency: async (code: string) => {
        await api.delete(`/currencies/${code}`);
    },

    enableCurrency: async (code: string) => {
        const response = await api.post(`/currencies/${code}/enable`);
        return response.data;
    },

    disableCurrency: async (code: string) => {
        const response = await api.post(`/currencies/${code}/disable`);
        return response.data;
    }
};

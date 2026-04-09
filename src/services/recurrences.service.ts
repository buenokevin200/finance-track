import api from './api';

export const recurrencesService = {
    getRecurrences: async () => {
        const response = await api.get('/recurrences');
        return response.data;
    }
};

import api from './api';

export const categoriesService = {
    getCategories: async () => {
        const response = await api.get('/categories');
        return response.data;
    },

    createCategory: async (name: string, notes?: string) => {
        const response = await api.post('/categories', { name, notes });
        return response.data;
    },

    updateCategory: async (id: string, name: string, notes?: string) => {
        const response = await api.put(`/categories/${id}`, { name, notes });
        return response.data;
    },

    deleteCategory: async (id: string) => {
        await api.delete(`/categories/${id}`);
    }
};

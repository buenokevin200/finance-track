import api from './api';

export interface Account {
    id: string;
    attributes: {
        name: string;
        type: string;
        current_balance: string;
        currency_symbol: string;
        active: boolean;
    };
}

// Internal interface for the frontend, reflecting flattened structure for easier use
export interface Transaction {
    id: string;
    attributes: {
        created_at: string;
        date: string;
        description: string;
        amount: string;
        currency_symbol: string;
        currency_code: string;
        type: 'withdrawal' | 'deposit' | 'transfer';
        source_name?: string;
        source_id?: string;
        destination_name?: string;
        destination_id?: string;
        category_name?: string;
        category_id?: string;
    };
}

export interface TransactionInput {
    type: 'withdrawal' | 'deposit' | 'transfer';
    date: string;
    amount: string;
    description: string;
    source_id?: string;
    source_name?: string;
    destination_id?: string;
    destination_name?: string;
    category_id?: string;
    category_name?: string; // Optional, often used for creating new on the fly if supported
    currency_code?: string;
}

export interface AccountInput {
    name: string;
    type: string;
    currency_code?: string;
    active?: boolean;
    balance?: string;
}

export interface Category {
    id: string;
    attributes: {
        name: string;
        notes?: string; // We will use notes to store the icon name
        created_at?: string;
        updated_at?: string;
    };
}

export interface Currency {
    id: string;
    attributes: {
        code: string;
        name: string;
        symbol: string;
        decimal_places?: number;
        enabled: boolean;
        default?: boolean;
    };
}

export interface CurrencyInput {
    code: string;
    name: string;
    symbol: string;
    decimal_places?: number;
    enabled?: boolean;
}

export const fireflyService = {
    getAccounts: async (type: 'asset' | 'expense' | 'revenue' = 'asset') => {
        const response = await api.get(`/accounts?type=${type}`);
        return response.data;
    },

    getTransactions: async (page = 1, type?: 'withdrawal' | 'deposit' | 'transfer', start?: string, end?: string) => {
        let url = `/transactions?page=${page}`;
        if (type) url += `&type=${type}`;
        if (start && end) {
            url += `&start=${start}&end=${end}`;
        }
        const response = await api.get(url);

        // Transform Firefly's nested structure to our flat structure
        const flattenedData = response.data.data.map((item: any) => {
            const split = item.attributes.transactions[0];
            return {
                id: item.id,
                attributes: {
                    created_at: item.attributes.created_at,
                    date: split.date, // ISO date string from split
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
        });

        return {
            ...response.data,
            data: flattenedData
        };
    },

    createTransaction: async (data: TransactionInput) => {
        // Firefly expects an array of transactions
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

    getAccount: async (id: string) => {
        const response = await api.get(`/accounts/${id}`);
        return response.data;
    },

    // Helper to get expense accounts (payees) or revenue accounts (payers) if needed
    // Usually 'getAccounts' with type is enough, but sometimes we need to search
    searchAccounts: async (query: string, type: 'asset' | 'expense' | 'revenue') => {
        // Simplified search via list filter for now, or use /search/accounts if available
        const accounts = await fireflyService.getAccounts(type);
        // Client side filter of the page result (not perfect but OK for MVP)
        return accounts.data.filter((a: Account) => a.attributes.name.toLowerCase().includes(query.toLowerCase()));
    },

    createAccount: async (data: AccountInput) => {
        const payload: any = {
            name: data.name,
            type: data.type,
            currency_code: data.currency_code,
            active: data.active !== undefined ? data.active : true, // Default to true
        };

        if (data.type === 'asset') {
            payload.account_role = 'defaultAsset';
        }

        if (data.balance && parseFloat(data.balance) !== 0) {
            payload.opening_balance = data.balance;
            payload.opening_balance_date = new Date().toISOString().split('T')[0];
        }

        const response = await api.post('/accounts', payload);
        return response.data;
    },

    updateAccount: async (id: string, data: AccountInput) => {
        const payload = {
            name: data.name,
            type: data.type,
            currency_code: data.currency_code,
            active: data.active !== undefined ? data.active : true,
        };
        const response = await api.put(`/accounts/${id}`, payload);
        return response.data;
    },

    deleteAccount: async (id: string) => {
        await api.delete(`/accounts/${id}`);
    },

    // Dashboard Data Helpers
    getDashboardData: async (startDate: string, endDate: string) => {
        // 1. Net Worth (Sum of all asset accounts)
        const accounts = await api.get('/accounts?type=asset');
        const netWorth = accounts.data.data.reduce((acc: number, curr: any) => {
            return acc + parseFloat(curr.attributes.current_balance || '0');
        }, 0);

        // 2. Spending & Income (Transactions)
        // We fetch transactions for the period. Note: This could be heavy if there are many.
        // Better to use insights if available, but staying simple for MVP.
        const transactionsResponse = await api.get(`/transactions?start=${startDate}&end=${endDate}`);
        const transactions = transactionsResponse.data.data;

        let income = 0;
        let expenses = 0;
        let billsToPay = 0; // Simplified logic, Firefly has 'bills' endpoint but standard expenses work too

        transactions.forEach((item: any) => {
            const split = item.attributes.transactions[0];
            const amount = parseFloat(split.amount);
            if (split.type === 'deposit') {
                income += amount;
            } else if (split.type === 'withdrawal') {
                expenses += amount;
            }
        });

        // 3. Top Spending Categories
        // manually aggregating for now
        const categoriesMap = new Map<string, number>();
        transactions.forEach((item: any) => {
            const split = item.attributes.transactions[0];
            if (split.type === 'withdrawal' && split.category_name) {
                const current = categoriesMap.get(split.category_name) || 0;
                categoriesMap.set(split.category_name, current + parseFloat(split.amount));
            }
        });

        const topCategories = Array.from(categoriesMap.entries())
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5); // Top 5

        return {
            netWorth: netWorth.toFixed(2),
            income: income.toFixed(2),
            expenses: expenses.toFixed(2),
            billsToPay: billsToPay.toFixed(2), // Placeholder for now
            topCategories
        };
    },

    getSummary: async (_start: string, _end: string) => {
        // Firefly doesn't have a single "summary" endpoint, usually strictly via insights or custom calculation
        // We will simulate summary by fetching accounts or basic insights if available.
        // For now, we return basic account info or 'insight' data if the user's version supports it.
        // This is a placeholder for more complex logic.
        return {
            net_worth: 0, // Calculated from assets
            earned: 0,
            spent: 0
        };
    },

    getBasicInsight: async () => {
        // Mock implementation until we define exact endpoints needed
        return {};
    },

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
    },

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

import api from './api';

export const dashboardService = {
    getDashboardData: async (startDate: string, endDate: string) => {
        const accountsResponse = await api.get('/accounts?type=asset');
        const netWorth = accountsResponse.data.data.reduce((acc: number, curr: any) => {
            return acc + parseFloat(curr.attributes.current_balance || '0');
        }, 0);

        const transactionsResponse = await api.get(`/transactions?start=${startDate}&end=${endDate}`);
        const transactions = transactionsResponse.data.data;

        let income = 0;
        let expenses = 0;
        let billsToPay = 0;

        transactions.forEach((item: any) => {
            const split = item.attributes.transactions[0];
            const amount = parseFloat(split.amount);
            if (split.type === 'deposit') {
                income += amount;
            } else if (split.type === 'withdrawal') {
                expenses += amount;
            }
        });

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
            .slice(0, 5);

        return {
            netWorth: netWorth.toFixed(2),
            income: income.toFixed(2),
            expenses: expenses.toFixed(2),
            billsToPay: billsToPay.toFixed(2),
            topCategories
        };
    },

    getSummary: async (_start: string, _end: string) => {
        return {
            net_worth: 0,
            earned: 0,
            spent: 0
        };
    },

    getBasicInsight: async () => {
        return {};
    }
};

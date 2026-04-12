export interface Account {
    id: string;
    attributes: {
        name: string;
        type: string;
        current_balance: string;
        currency_symbol: string;
        currency_code: string;
        active: boolean;
        iban?: string;
        bic?: string;
        account_number?: string;
        opening_balance?: string;
        current_debt?: string;
        account_role?: string;
        liability_type?: string;
        notes?: string;
    };
}

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
    category_name?: string;
    currency_code?: string;
}

export interface AccountInput {
    name: string;
    type: string;
    currency_code?: string;
    active?: boolean;
    opening_balance?: string;
    opening_balance_date?: string;
    iban?: string;
    bic?: string;
    account_number?: string;
    account_role?: string;
    virtual_balance?: string;
    notes?: string;
    liability_type?: 'loan' | 'debt' | 'mortgage';
    liability_amount?: string;
    liability_direction?: 'credit' | 'debit';
    interest?: string;
    interest_period?: 'weekly' | 'monthly' | 'quarterly' | 'half-year' | 'yearly' | 'daily';
    cc_closing_day?: string;
    cc_payment_day?: string;
    is_cc?: boolean;
}

export interface Category {
    id: string;
    attributes: {
        name: string;
        notes?: string;
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

export interface Subscription {
    id: string;
    attributes: {
        name: string;
        amount_min: string;
        amount_max: string;
        date: string;
        repeat_freq: string;
        active: boolean;
        notes?: string;
    };
}

export interface SubscriptionInput {
    name: string;
    amount_min: string;
    amount_max: string;
    date: string;
    repeat_freq: 'weekly' | 'monthly' | 'quarterly' | 'half-year' | 'yearly';
    notes?: string;
    asset_account_id?: string;
}

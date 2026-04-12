import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Login } from '@/components/auth/Login';
import { Layout } from '@/components/layout/Layout';
import { Settings } from '@/components/settings/Settings';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Transactions } from '@/components/transactions/Transactions';
import { Accounts } from '@/components/accounts/Accounts';
import { CreateAccountPage } from '@/components/accounts/CreateAccountPage';
import { EditAccountPage } from '@/components/accounts/EditAccountPage';
import { AccountDetail } from '@/components/accounts/AccountDetail';
import { Categories } from '@/components/categories/Categories';
import { Currencies } from '@/components/currencies/Currencies';
import { Subscriptions } from '@/components/subscriptions/Subscriptions';
import { Toaster } from 'sonner';
import '@/i18n/config';

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" richColors />
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/accounts" element={<Accounts />} />
                        <Route path="/accounts/new" element={<CreateAccountPage />} />
                        <Route path="/accounts/:id" element={<AccountDetail />} />
                        <Route path="/accounts/edit/:id" element={<EditAccountPage />} />
                        <Route path="/subscriptions" element={<Subscriptions />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/currencies" element={<Currencies />} />
                        <Route path="/budgets" element={<div className="p-4">Budgets (Coming Soon)</div>} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

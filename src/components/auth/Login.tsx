import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';

export const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(t('auth.login_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-full mb-4">
                        <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('app.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {t('auth.login')}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        label={t('auth.email')}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <Input
                        label={t('auth.password')}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={loading}
                    >
                        {t('auth.login')}
                    </Button>
                </form>

                {/* Helper for demo purposes */}
                <div className="mt-6 text-center text-xs text-gray-400">
                    <p>Demo Mode: Make sure Firebase Auth is enabled in console.</p>
                </div>
            </div>
        </div>
    );
};

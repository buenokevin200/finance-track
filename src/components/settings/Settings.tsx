import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Moon, Sun, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export const Settings = () => {
    const { t, i18n } = useTranslation();
    const { fireflyUrl, fireflyToken, setFireflyConfig } = useAuthStore();
    const { isDark, toggleTheme } = useThemeStore();

    const [url, setUrl] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (fireflyUrl) setUrl(fireflyUrl);
        if (fireflyToken) setToken(fireflyToken);
    }, [fireflyUrl, fireflyToken]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setFireflyConfig(url, token);
        setMessage(t('settings.save_success'));
        setTimeout(() => setMessage(''), 3000);
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('settings.title')}
            </h1>

            {/* API Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Save className="w-5 h-5 mr-2" />
                    {t('settings.api_config')}
                </h2>

                <form onSubmit={handleSave} className="space-y-4">
                    <Input
                        label={t('settings.api_url')}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://your-firefly-instance.com/api/v1"
                        required
                    />

                    <Input
                        label={t('settings.api_token')}
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="eyJ..."
                        required
                    />

                    <div className="flex items-center justify-between">
                        <Button type="submit">
                            {t('common.save')}
                        </Button>
                        {message && (
                            <span className="text-green-600 dark:text-green-400 text-sm">
                                {message}
                            </span>
                        )}
                    </div>
                </form>
            </div>

            {/* Appearance & Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Moon className="w-5 h-5 mr-2" />
                        {t('settings.appearance')}
                    </h2>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                            {t('settings.dark_mode')}
                        </span>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {isDark ? (
                                <Moon className="w-6 h-6 text-blue-500" />
                            ) : (
                                <Sun className="w-6 h-6 text-orange-500" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Globe className="w-5 h-5 mr-2" />
                        {t('settings.language')}
                    </h2>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                            {i18n.language === 'en' ? 'English' : 'Español'}
                        </span>
                        <Button variant="secondary" size="sm" onClick={toggleLanguage}>
                            {i18n.language === 'en' ? 'Switch to Español' : 'Cambiar a English'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

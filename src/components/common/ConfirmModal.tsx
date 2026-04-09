import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    variant = 'danger',
    isLoading = false
}) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const variantStyles = {
        danger: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        primary: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    }[variant];

    const btnStyles = {
        danger: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-amber-600 hover:bg-amber-700',
        primary: 'bg-blue-600 hover:bg-blue-700'
    }[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`mb-4 rounded-full p-3 ${variantStyles}`}>
                        <AlertCircle className="h-8 w-8" />
                    </div>
                    
                    <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex w-full gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {cancelText || t('common.cancel')}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            isLoading={isLoading}
                            className={`flex-1 text-white ${btnStyles}`}
                        >
                            {confirmText || t('common.delete')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

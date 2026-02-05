import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';

interface IconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
}

// A curated list of icons suitable for finance categories
const RELEVANT_ICONS = [
    'ShoppingBag', 'ShoppingCart', 'Utensils', 'Coffee', 'Car', 'Bus', 'Plane',
    'Home', 'Zap', 'Wifi', 'Phone', 'PlayCircle', 'Music', 'Book', 'GraduationCap',
    'Briefcase', 'DollarSign', 'CreditCard', 'PiggyBank', 'Gift', 'Heart',
    'Stethoscope', 'Pill', 'Dumbbell', 'Gamepad2', 'Shirt', 'Watch', 'Scissors',
    'Hammer', 'Wrench', 'Smartphone', 'Laptop', 'Camera', 'Umbrella', 'Sun',
    'Moon', 'Cloud', 'Trash2', 'AlertCircle', 'HelpCircle'
];

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredIcons = RELEVANT_ICONS.filter(iconName =>
        iconName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SelectedIcon = (LucideIcons as any)[value] || LucideIcons.HelpCircle;

    return (
        <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Icon
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
                <div className="flex items-center space-x-2">
                    <SelectedIcon className="h-5 w-5" />
                    <span>{value || 'Select Icon'}</span>
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-800">
                    <div className="sticky top-0 mb-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search icons..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {filteredIcons.map((iconName) => {
                            const Icon = (LucideIcons as any)[iconName];
                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => {
                                        onChange(iconName);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        "flex flex-col items-center justify-center rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700",
                                        value === iconName ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                                    )}
                                    title={iconName}
                                >
                                    <Icon className="h-6 w-6" />
                                </button>
                            );
                        })}
                    </div>
                    {filteredIcons.length === 0 && (
                        <p className="p-2 text-center text-sm text-gray-500">No icons found</p>
                    )}
                </div>
            )}
        </div>
    );
};

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { clsx } from 'clsx';

export interface ComboboxOption {
    id: string;
    name: string;
}

interface AccountComboboxProps {
    options: ComboboxOption[];
    valueId: string;
    valueName: string;
    onChange: (id: string, name: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const AccountCombobox: React.FC<AccountComboboxProps> = ({
    options,
    valueId,
    valueName,
    onChange,
    placeholder = "Buscar o crear...",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync external value
    useEffect(() => {
        if (valueId) {
            const opt = options.find(o => o.id === valueId);
            setQuery(opt ? opt.name : valueName);
        } else {
            setQuery(valueName);
        }
    }, [valueId, valueName, options]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = query === '' 
        ? options 
        : options.filter(opt => opt.name.toLowerCase().includes(query.toLowerCase()));

    const exactMatch = options.find(opt => opt.name.toLowerCase() === query.toLowerCase());

    const handleSelect = (id: string, name: string) => {
        setQuery(name);
        onChange(id, name);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setIsOpen(true);
        // If they keep typing, check if it matches an existing by chance
        const match = options.find(opt => opt.name.toLowerCase() === val.toLowerCase());
        if (match) {
            onChange(match.id, match.name);
        } else {
            onChange('', val);
        }
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    disabled={disabled}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full rounded-md border border-gray-300 pl-9 pr-10 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600 disabled:opacity-60"
                >
                    <ChevronDown className="h-4 w-4" />
                </button>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-[100] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 sm:text-sm">
                    {filteredOptions.length === 0 && query !== '' ? null : (
                        filteredOptions.map((opt) => (
                            <div
                                key={opt.id}
                                onClick={() => handleSelect(opt.id, opt.name)}
                                className={clsx(
                                    "relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-700",
                                    valueId === opt.id ? "text-blue-600 font-medium" : "text-gray-900 dark:text-gray-100"
                                )}
                            >
                                <span className="block truncate">{opt.name}</span>
                                {valueId === opt.id && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                        <Check className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                    {query !== '' && !exactMatch && (
                        <div
                            onClick={() => handleSelect('', query)}
                            className="relative cursor-pointer select-none py-2 px-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium border-t border-gray-100 dark:border-gray-700"
                        >
                            <span className="block truncate">Crear "{query}"...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

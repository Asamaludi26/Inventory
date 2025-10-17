import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { InboxIcon } from '../icons/InboxIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface Option {
    value: string;
    label: string;
    indicator?: React.ReactNode;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    emptyStateMessage?: string;
    emptyStateButtonLabel?: string;
    onEmptyStateClick?: () => void;
    direction?: 'up' | 'down';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
    options, 
    value, 
    onChange, 
    placeholder = 'Pilih...', 
    disabled = false,
    emptyStateMessage = 'Tidak ada pilihan tersedia.',
    emptyStateButtonLabel,
    onEmptyStateClick,
    direction = 'down'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };
    
    const directionClasses = direction === 'down' 
        ? 'mt-1 origin-top' 
        : 'mb-1 bottom-full origin-bottom';

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex items-center justify-between w-full px-3 py-2 text-left bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-tm-accent sm:text-sm ${disabled ? 'bg-gray-200/60 text-gray-500 cursor-not-allowed' : 'text-gray-900 cursor-pointer'}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption?.indicator}
                    <span 
                        className={`truncate ${selectedOption ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                        title={selectedOption ? selectedOption.label : placeholder}
                    >
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            <div
                className={`absolute z-20 w-full overflow-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60 custom-scrollbar transition-all duration-150 ease-in-out
                    ${directionClasses}
                    ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`
                }
                role="listbox"
            >
                {options.length > 0 ? (
                    <ul>
                        {options.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer transition-colors duration-150
                                    ${value === option.value 
                                        ? 'bg-tm-primary/10 text-tm-primary font-semibold' 
                                        : 'text-gray-900 hover:bg-tm-light'}`
                                }
                                role="option"
                                aria-selected={value === option.value}
                                title={option.label}
                            >
                                <div className="flex items-center gap-2">
                                    {option.indicator}
                                    <span className="truncate">{option.label}</span>
                                </div>
                                {value === option.value && <CheckIcon className="w-4 h-4" />}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                        <InboxIcon className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="mt-2">{emptyStateMessage}</p>
                        {onEmptyStateClick && emptyStateButtonLabel && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    onEmptyStateClick();
                                }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 mt-3 text-xs font-semibold text-white transition-colors rounded-md shadow-sm bg-tm-accent hover:bg-tm-primary"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                {emptyStateButtonLabel}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
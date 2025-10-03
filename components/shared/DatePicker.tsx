import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon } from '../icons/CalendarIcon';

interface DatePickerProps {
    id: string;
    selectedDate: Date | null;
    onDateChange: (date: Date) => void;
    disablePastDates?: boolean;
    disableFutureDates?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ id, selectedDate, onDateChange, disablePastDates = false, disableFutureDates = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    useEffect(() => {
        if (selectedDate) {
            setCurrentMonth(selectedDate);
        }
    }, [selectedDate]);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const changeMonth = (offset: number) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        onDateChange(newDate);
        setIsOpen(false);
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const numDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const blanks = Array(startDay).fill(null);
        const days = Array.from({ length: numDays }, (_, i) => i + 1);

        const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (
            <div className="absolute z-10 w-64 p-2 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <button type="button" onClick={() => changeMonth(-1)} className="p-1 text-gray-600 rounded-full hover:bg-gray-100">&lt;</button>
                    <span className="font-semibold text-sm text-gray-800">
                        {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentMonth)}
                    </span>
                    <button type="button" onClick={() => changeMonth(1)} className="p-1 text-gray-600 rounded-full hover:bg-gray-100">&gt;</button>
                </div>
                <div className="grid grid-cols-7 text-xs font-medium text-center text-gray-600">
                    {dayHeaders.map(day => <div key={day} className="py-1">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 text-sm text-center">
                    {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
                    {days.map(day => {
                        const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                        const currentDate = new Date(year, month, day);
                        currentDate.setHours(0,0,0,0);

                        let isDisabled = false;
                        if (disablePastDates && currentDate < today) {
                            isDisabled = true;
                        }
                        if (disableFutureDates && currentDate > today) {
                            isDisabled = true;
                        }
                        
                        const buttonClasses = `w-8 h-8 rounded-full transition-colors ${
                            isSelected
                              ? 'bg-tm-primary text-white'
                              : isDisabled
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`;

                        return (
                            <div key={day} className="py-1">
                                <button
                                    type="button"
                                    onClick={() => handleDayClick(day)}
                                    disabled={isDisabled}
                                    className={buttonClasses}
                                >
                                    {day}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const formattedDate = selectedDate 
        ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(selectedDate)
        : '';

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    id={id}
                    readOnly
                    value={formattedDate}
                    onClick={() => setIsOpen(!isOpen)}
                    placeholder="Pilih tanggal"
                    className="block w-full pl-3 pr-10 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-tm-accent focus:border-tm-accent sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                </div>
            </div>
            {isOpen && renderCalendar()}
        </div>
    );
};

export default DatePicker;

import React from 'react';
import { Tooltip } from '../../../components/ui/Tooltip';

interface DashboardCardProps {
    title: string;
    value: string | number;
    secondaryMetric: string;
    icon: React.FC<{ className?: string }>;
    color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
    onClick: () => void;
    tooltipText?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, secondaryMetric, icon: Icon, color, onClick, tooltipText }) => {
    const colorClasses = {
        blue: { border: 'bg-blue-500', text: 'text-blue-500' },
        green: { border: 'bg-green-500', text: 'text-green-500' },
        amber: { border: 'bg-amber-500', text: 'text-amber-500' },
        red: { border: 'bg-red-500', text: 'text-red-500' },
        purple: { border: 'bg-purple-500', text: 'text-purple-500' },
    };
    const currentColors = colorClasses[color];

    const cardContent = (
        <div 
            onClick={onClick}
            className="relative flex flex-col justify-between bg-white border border-gray-200/80 rounded-xl shadow-sm transition-all duration-300 cursor-pointer group hover:shadow-lg hover:-translate-y-1 h-full"
        >
            <div className={`h-1.5 ${currentColors.border} rounded-t-xl`}></div>
            
            <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-sm font-semibold text-gray-500 group-hover:text-tm-primary transition-colors">{title}</h3>
                        <Icon className={`w-6 h-6 flex-shrink-0 ${currentColors.text} opacity-80`} />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-tm-dark truncate">{value}</p>
                </div>
                <p className="mt-2 text-xs text-gray-500">{secondaryMetric}</p>
            </div>
        </div>
    );

    if (tooltipText) {
        return <Tooltip text={tooltipText}>{cardContent}</Tooltip>;
    }

    return cardContent;
};

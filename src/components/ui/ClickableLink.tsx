import React from 'react';
import { EyeIcon } from '../icons/EyeIcon';

interface ClickableLinkProps {
    children: React.ReactNode;
    onClick?: () => void;
    title?: string;
    className?: string;
}

export const ClickableLink: React.FC<ClickableLinkProps> = ({ children, onClick, title, className }) => (
    <span 
        onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
        }} 
        title={title} 
        className={`inline-flex items-center gap-1.5 font-medium hover:underline cursor-pointer transition-colors duration-150 align-middle ${className}`}
    >
        <EyeIcon className="w-4 h-4 flex-shrink-0" />
        {children}
    </span>
);

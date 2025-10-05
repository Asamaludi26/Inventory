import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-x-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-x-transparent border-b-gray-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-y-transparent border-l-gray-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-y-transparent border-r-gray-800',
  }

  return (
    <div className="relative flex items-center group">
      {children}
      <div
        className={`absolute z-20 whitespace-nowrap px-3 py-1.5 text-xs font-semibold text-white bg-gray-800 rounded-md
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                    ${positionClasses[position]}`}
        role="tooltip"
      >
        {text}
        <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
      </div>
    </div>
  );
};
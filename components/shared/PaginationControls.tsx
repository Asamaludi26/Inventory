import React from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (newPage: number) => void;
    onItemsPerPageChange: (newSize: number) => void;
    startIndex: number;
    endIndex: number;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    startIndex,
    endIndex
}) => {
    // Correctly calculate the start and end item numbers for display.
    const startItem = totalItems > 0 ? startIndex + 1 : 0;
    const endItem = Math.min(endIndex, totalItems);
    
    return (
        <div className="flex flex-col items-center justify-between gap-4 p-4 border-t border-gray-200 sm:flex-row">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
                <span>Tampilkan</span>
                <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="h-8 px-2 py-1 text-sm bg-white border border-gray-300 rounded-md focus:ring-tm-accent focus:border-tm-accent"
                >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                 <span>per halaman</span>
            </div>

            <span className="text-sm text-gray-700">
                Menampilkan <span className="font-semibold text-gray-900">{startItem}</span>-<span className="font-semibold text-gray-900">{endItem}</span> dari <span className="font-semibold text-gray-900">{totalItems}</span> hasil
            </span>

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-600 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Halaman sebelumnya"
                >
                    <ChevronLeftIcon className="w-5 h-5"/>
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-600 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Halaman selanjutnya"
                >
                    <ChevronRightIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

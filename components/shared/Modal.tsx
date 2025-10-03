import React, { useEffect } from 'react';
import { CloseIcon } from '../icons/CloseIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  hideDefaultCloseButton?: boolean;
  closeButtonText?: string;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footerContent, size = 'lg', hideDefaultCloseButton = false, closeButtonText = 'Tutup' }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-60"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className={`relative w-full ${sizeClasses[size]} bg-white rounded-xl shadow-xl transform transition-all flex flex-col max-h-full`}>
        <div className="flex items-start justify-between p-4 border-b rounded-t">
          <h3 className="text-xl font-semibold text-gray-900" id="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="inline-flex items-center p-1.5 ml-auto text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <CloseIcon className="w-5 h-5" />
            <span className="sr-only">Tutup modal</span>
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
        {(footerContent || !hideDefaultCloseButton) && (
             <div className="flex items-center justify-end p-4 space-x-3 border-t bg-gray-50 rounded-b-xl">
                {!hideDefaultCloseButton && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                        >
                        {closeButtonText}
                    </button>
                )}
                {footerContent}
            </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

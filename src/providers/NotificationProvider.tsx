import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { SuccessIcon } from '../components/icons/SuccessIcon';
import { ErrorIcon } from '../components/icons/ErrorIcon';
import { CloseIcon } from '../components/icons/CloseIcon';
import { InfoIcon } from '../components/icons/InfoIcon';
import { ExclamationTriangleIcon } from '../components/icons/ExclamationTriangleIcon';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  actions?: NotificationAction[];
  duration?: number;
}

type NotificationContextType = (
    message: string, 
    type?: NotificationType, 
    options?: { actions?: NotificationAction[]; duration?: number }
) => void;

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const typeDetails = {
  success: { Icon: SuccessIcon, barClass: 'bg-success' },
  error: { Icon: ErrorIcon, barClass: 'bg-danger' },
  info: { Icon: InfoIcon, barClass: 'bg-info' },
  warning: { Icon: ExclamationTriangleIcon, barClass: 'bg-warning' },
};

const Toast: React.FC<{ notification: Notification; onRemove: (id: number) => void }> = ({ notification, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(notification.id);
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
    }, [notification, onRemove]);

    const details = typeDetails[notification.type];
    const { Icon } = details;

    const getIconColorClass = () => {
        switch (notification.type) {
            case 'success': return 'text-success';
            case 'error': return 'text-danger';
            case 'warning': return 'text-warning-text';
            case 'info': return 'text-info';
            default: return 'text-gray-500';
        }
    };

    return (
        <div 
            className="flex items-start w-full max-w-sm p-4 bg-white border border-gray-200 rounded-xl shadow-lg pointer-events-auto animate-fade-in-up"
            role="alert"
        >
            <div className="flex-shrink-0 pt-0.5">
                <Icon className={`w-6 h-6 ${getIconColorClass()}`} />
            </div>
            <div className="flex-1 w-0 ml-3">
                <p className="text-sm font-semibold text-gray-900">{notification.message}</p>
                 {notification.actions && notification.actions.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                        {notification.actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation(); // prevent any other click handlers
                                    action.onClick();
                                    onRemove(notification.id);
                                }}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors shadow-sm ${
                                    action.variant === 'secondary'
                                        ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                        : 'text-white bg-tm-primary hover:bg-tm-primary-hover'
                                }`}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex-shrink-0 ml-4">
                <button
                    onClick={() => onRemove(notification.id)}
                    className="inline-flex text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent"
                >
                    <span className="sr-only">Close</span>
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};


export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
      message: string, 
      type: NotificationType = 'success',
      options: { actions?: NotificationAction[]; duration?: number } = {}
    ) => {
    const id = Date.now();
    const newNotification: Notification = { id, message, type, ...options };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={addNotification}>
      {children}
      
      <div
        aria-live="assertive"
        className="fixed inset-0 z-[100] flex items-end px-4 py-6 pointer-events-none sm:p-6"
      >
        <div className="flex flex-col items-end w-full space-y-4">
          {notifications.map((notification) => (
            <Toast key={notification.id} notification={notification} onRemove={removeNotification} />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

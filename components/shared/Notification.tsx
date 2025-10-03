import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { SuccessIcon } from '../icons/SuccessIcon';
import { ErrorIcon } from '../icons/ErrorIcon';
import { CloseIcon } from '../icons/CloseIcon';

export type NotificationType = 'success' | 'error';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

type NotificationContextType = (message: string, type: NotificationType) => void;

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const typeClasses = {
  success: {
    bg: 'bg-success-light',
    border: 'border-success',
    text: 'text-success-text',
    Icon: SuccessIcon,
  },
  error: {
    bg: 'bg-danger-light',
    border: 'border-danger',
    text: 'text-danger-text',
    Icon: ErrorIcon,
  },
};

const NotificationItem: React.FC<{ notification: Notification; onDismiss: (id: number) => void }> = ({ notification, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);
    const classes = typeClasses[notification.type];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(notification.id), 300); // Match animation duration
        }, 4000); // 4 seconds before starting to exit

        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(notification.id), 300);
    };

    return (
        <div 
          className={`
            flex items-start p-4 w-full max-w-sm rounded-lg shadow-lg border-l-4 transition-all duration-300 ease-in-out transform
            ${classes.bg} ${classes.border} ${classes.text}
            ${isExiting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}
            animate-fade-in-down
          `}
          role="alert"
        >
            <div className="flex-shrink-0">
                <classes.Icon className="w-6 h-6" />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                <button onClick={handleDismiss} className="inline-flex rounded-md p-1.5 text-current hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-current focus:ring-white">
                    <span className="sr-only">Tutup</span>
                    <CloseIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: NotificationType = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={addNotification}>
      {children}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 flex flex-col items-center gap-2">
        {notifications.map(notification => (
          <NotificationItem key={notification.id} notification={notification} onDismiss={removeNotification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

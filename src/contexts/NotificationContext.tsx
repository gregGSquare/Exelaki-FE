import React, { createContext, useContext, useState, ReactNode } from 'react';
import ToastNotification, { ToastType } from '../components/ToastNotification';

interface Notification {
  id: string;
  message: string;
  type: ToastType;
}

interface NotificationContextProps {
  showNotification: (message: string, type: ToastType) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {notifications.map(notification => (
        <ToastNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 
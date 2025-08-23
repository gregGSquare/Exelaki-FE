import React, { createContext, useContext, useState, ReactNode } from 'react';
import ToastNotificationV2, { ToastType } from '../ui-v2/feedback-v2/ToastNotificationV2';

interface Notification {
  id: string;
  message: string;
  type: ToastType;
}

interface NotificationContextProps {
  showNotification: (message: any, type: ToastType) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: any, type: ToastType) => {
    const id = Date.now().toString();
    
    // Extract message from error response or use as is if it's a string
    let finalMessage: string;
    
    if (typeof message === 'string') {
      finalMessage = message;
    } else if (message && typeof message.message === 'string') {
      // Extract message from error response object
      finalMessage = message.message;
    } else if (message && typeof message === 'object') {
      // Try to stringify the object
      try {
        finalMessage = JSON.stringify(message);
      } catch (e) {
        finalMessage = 'An error occurred';
      }
    } else {
      finalMessage = 'An error occurred';
    }
    
    setNotifications(prev => [...prev, { id, message: finalMessage, type }]);
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <div 
        className="notification-container" 
        style={{ 
          position: 'fixed', 
          top: '1rem', 
          right: '1rem', 
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: '24rem'
        }}
      >
        {notifications.map(notification => (
          <ToastNotificationV2
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => hideNotification(notification.id)}
          />
        ))}
      </div>
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
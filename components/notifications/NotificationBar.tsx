import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { AppNotification } from '../../types';

const NotificationItem: React.FC<{ notification: AppNotification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  const bgColor = notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div className={`p-3 rounded-md shadow-lg text-white ${bgColor} flex justify-between items-center`}>
      <span>{notification.message}</span>
      <button onClick={() => onDismiss(notification.id)} className="ml-4 text-sm opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
};

export const NotificationBar: React.FC = () => {
  const { notifications, dismissNotification } = useAppContext();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-2">
      {notifications.map(notif => (
        <NotificationItem key={notif.id} notification={notif} onDismiss={dismissNotification} />
      ))}
    </div>
  );
};

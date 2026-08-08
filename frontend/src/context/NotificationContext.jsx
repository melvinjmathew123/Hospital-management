import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    // Connect to socket.io server
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      // Register this user so the server maps userId → socketId
      socket.emit('register', user._id);
    });

    socket.on('notification', (data) => {
      setNotifications((prev) => [
        { ...data, id: Date.now() + Math.random(), read: false },
        ...prev,
      ]);
      // Browser notification (if permission granted)
      if (Notification.permission === 'granted') {
        new Notification(`${data.icon || '🔔'} ${data.title}`, {
          body: data.message,
          icon: '/favicon.svg',
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => setNotifications([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markOneRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);

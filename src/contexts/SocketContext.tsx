import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Socket event types
export enum SocketEvent {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // Authentication events
  AUTHENTICATE = 'authenticate',
  AUTHENTICATED = 'authenticated',
  UNAUTHORIZED = 'unauthorized',

  // Product events
  PRODUCT_UPDATED = 'product:updated',
  PRODUCT_MENTIONED = 'product:mentioned',
  PRODUCT_TRENDING = 'product:trending',

  // User events
  USER_FAVORITE_ADDED = 'user:favorite:added',
  USER_FAVORITE_REMOVED = 'user:favorite:removed',
  USER_NOTIFICATION = 'user:notification',

  // Search events
  SEARCH_RESULTS = 'search:results',
  SEARCH_TRENDING = 'search:trending',

  // Subscription events
  SUBSCRIBE_PRODUCT = 'subscribe:product',
  UNSUBSCRIBE_PRODUCT = 'unsubscribe:product',
  SUBSCRIBE_SEARCH = 'subscribe:search',
  UNSUBSCRIBE_SEARCH = 'unsubscribe:search'
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribeToProduct: (productId: number) => void;
  unsubscribeFromProduct: (productId: number) => void;
  subscribeToSearch: (query: string) => void;
  unsubscribeFromSearch: (query: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  subscribeToProduct: () => {},
  unsubscribeFromProduct: () => {},
  subscribeToSearch: () => {},
  unsubscribeFromSearch: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();
  // Get token from localStorage
  const token = localStorage.getItem('pw_access_token');

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketInstance.on(SocketEvent.CONNECT, () => {
      console.log('Socket connected');
      setIsConnected(true);

      // Authenticate if user is logged in
      if (isAuthenticated && token) {
        socketInstance.emit(SocketEvent.AUTHENTICATE, { token });
      }
    });

    socketInstance.on(SocketEvent.DISCONNECT, () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on(SocketEvent.ERROR, (error) => {
      console.error('Socket error:', error);
    });

    socketInstance.on(SocketEvent.AUTHENTICATED, (data) => {
      console.log('Socket authenticated:', data);
    });

    socketInstance.on(SocketEvent.UNAUTHORIZED, (error) => {
      console.error('Socket authentication failed:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Re-authenticate when auth state changes
  useEffect(() => {
    if (socket && isConnected && isAuthenticated && token) {
      socket.emit(SocketEvent.AUTHENTICATE, { token });
    }
  }, [socket, isConnected, isAuthenticated, token]);

  // Subscribe to product updates
  const subscribeToProduct = (productId: number) => {
    if (socket && isConnected) {
      socket.emit(SocketEvent.SUBSCRIBE_PRODUCT, { productId });
    }
  };

  // Unsubscribe from product updates
  const unsubscribeFromProduct = (productId: number) => {
    if (socket && isConnected) {
      socket.emit(SocketEvent.UNSUBSCRIBE_PRODUCT, { productId });
    }
  };

  // Subscribe to search updates
  const subscribeToSearch = (query: string) => {
    if (socket && isConnected) {
      socket.emit(SocketEvent.SUBSCRIBE_SEARCH, { query });
    }
  };

  // Unsubscribe from search updates
  const unsubscribeFromSearch = (query: string) => {
    if (socket && isConnected) {
      socket.emit(SocketEvent.UNSUBSCRIBE_SEARCH, { query });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        subscribeToProduct,
        unsubscribeFromProduct,
        subscribeToSearch,
        unsubscribeFromSearch,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

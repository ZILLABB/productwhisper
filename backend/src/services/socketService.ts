import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import logger from './loggerService';
import { verifyToken } from '../config/jwt';
import { userRepository } from '../repositories';

/**
 * Socket event types
 */
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

/**
 * Socket service for real-time updates
 */
export class SocketService {
  private io: SocketServer | null = null;
  private userSockets: Map<number, string[]> = new Map(); // userId -> socketIds
  private productSubscriptions: Map<number, string[]> = new Map(); // productId -> socketIds
  private searchSubscriptions: Map<string, string[]> = new Map(); // searchQuery -> socketIds
  
  /**
   * Initialize Socket.IO server
   * @param server - HTTP server instance
   */
  initialize(server: HttpServer): void {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? ['https://productwhisper.com', 'https://www.productwhisper.com']
          : '*',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    // Set up connection handler
    this.io.on(SocketEvent.CONNECT, (socket) => this.handleConnection(socket));
    
    logger.info('Socket.IO server initialized');
  }
  
  /**
   * Handle new socket connection
   * @param socket - Socket instance
   */
  private handleConnection(socket: any): void {
    logger.info(`Socket connected: ${socket.id}`);
    
    // Handle authentication
    socket.on(SocketEvent.AUTHENTICATE, async (data: { token: string }) => {
      try {
        // Verify token
        const decoded = verifyToken(data.token);
        if (!decoded) {
          socket.emit(SocketEvent.UNAUTHORIZED, { message: 'Invalid token' });
          return;
        }
        
        // Get user
        const user = await userRepository.findById(decoded.userId);
        if (!user) {
          socket.emit(SocketEvent.UNAUTHORIZED, { message: 'User not found' });
          return;
        }
        
        // Store user ID in socket
        socket.userId = user.id;
        
        // Add socket to user's sockets
        if (!this.userSockets.has(user.id)) {
          this.userSockets.set(user.id, []);
        }
        this.userSockets.get(user.id)?.push(socket.id);
        
        // Join user's room
        socket.join(`user:${user.id}`);
        
        // Emit authenticated event
        socket.emit(SocketEvent.AUTHENTICATED, {
          userId: user.id,
          username: user.username
        });
        
        logger.info(`Socket authenticated: ${socket.id} (User: ${user.id})`);
      } catch (error) {
        logger.error('Socket authentication error:', error);
        socket.emit(SocketEvent.UNAUTHORIZED, { message: 'Authentication failed' });
      }
    });
    
    // Handle product subscription
    socket.on(SocketEvent.SUBSCRIBE_PRODUCT, (data: { productId: number }) => {
      const { productId } = data;
      
      // Join product room
      socket.join(`product:${productId}`);
      
      // Add socket to product subscriptions
      if (!this.productSubscriptions.has(productId)) {
        this.productSubscriptions.set(productId, []);
      }
      this.productSubscriptions.get(productId)?.push(socket.id);
      
      logger.info(`Socket subscribed to product: ${socket.id} (Product: ${productId})`);
    });
    
    // Handle product unsubscription
    socket.on(SocketEvent.UNSUBSCRIBE_PRODUCT, (data: { productId: number }) => {
      const { productId } = data;
      
      // Leave product room
      socket.leave(`product:${productId}`);
      
      // Remove socket from product subscriptions
      if (this.productSubscriptions.has(productId)) {
        const sockets = this.productSubscriptions.get(productId) || [];
        const index = sockets.indexOf(socket.id);
        if (index !== -1) {
          sockets.splice(index, 1);
        }
      }
      
      logger.info(`Socket unsubscribed from product: ${socket.id} (Product: ${productId})`);
    });
    
    // Handle search subscription
    socket.on(SocketEvent.SUBSCRIBE_SEARCH, (data: { query: string }) => {
      const { query } = data;
      
      // Join search room
      socket.join(`search:${query}`);
      
      // Add socket to search subscriptions
      if (!this.searchSubscriptions.has(query)) {
        this.searchSubscriptions.set(query, []);
      }
      this.searchSubscriptions.get(query)?.push(socket.id);
      
      logger.info(`Socket subscribed to search: ${socket.id} (Query: ${query})`);
    });
    
    // Handle search unsubscription
    socket.on(SocketEvent.UNSUBSCRIBE_SEARCH, (data: { query: string }) => {
      const { query } = data;
      
      // Leave search room
      socket.leave(`search:${query}`);
      
      // Remove socket from search subscriptions
      if (this.searchSubscriptions.has(query)) {
        const sockets = this.searchSubscriptions.get(query) || [];
        const index = sockets.indexOf(socket.id);
        if (index !== -1) {
          sockets.splice(index, 1);
        }
      }
      
      logger.info(`Socket unsubscribed from search: ${socket.id} (Query: ${query})`);
    });
    
    // Handle disconnect
    socket.on(SocketEvent.DISCONNECT, () => {
      this.handleDisconnect(socket);
    });
  }
  
  /**
   * Handle socket disconnect
   * @param socket - Socket instance
   */
  private handleDisconnect(socket: any): void {
    logger.info(`Socket disconnected: ${socket.id}`);
    
    // Remove socket from user's sockets
    if (socket.userId && this.userSockets.has(socket.userId)) {
      const sockets = this.userSockets.get(socket.userId) || [];
      const index = sockets.indexOf(socket.id);
      if (index !== -1) {
        sockets.splice(index, 1);
      }
      
      // Remove user if no sockets left
      if (sockets.length === 0) {
        this.userSockets.delete(socket.userId);
      }
    }
    
    // Remove socket from product subscriptions
    this.productSubscriptions.forEach((sockets, productId) => {
      const index = sockets.indexOf(socket.id);
      if (index !== -1) {
        sockets.splice(index, 1);
        
        // Remove product if no sockets left
        if (sockets.length === 0) {
          this.productSubscriptions.delete(productId);
        }
      }
    });
    
    // Remove socket from search subscriptions
    this.searchSubscriptions.forEach((sockets, query) => {
      const index = sockets.indexOf(socket.id);
      if (index !== -1) {
        sockets.splice(index, 1);
        
        // Remove search if no sockets left
        if (sockets.length === 0) {
          this.searchSubscriptions.delete(query);
        }
      }
    });
  }
  
  /**
   * Emit event to all connected clients
   * @param event - Event name
   * @param data - Event data
   */
  emitToAll(event: SocketEvent, data: any): void {
    if (!this.io) return;
    
    this.io.emit(event, data);
    logger.debug(`Emitted event to all clients: ${event}`);
  }
  
  /**
   * Emit event to a specific user
   * @param userId - User ID
   * @param event - Event name
   * @param data - Event data
   */
  emitToUser(userId: number, event: SocketEvent, data: any): void {
    if (!this.io) return;
    
    this.io.to(`user:${userId}`).emit(event, data);
    logger.debug(`Emitted event to user ${userId}: ${event}`);
  }
  
  /**
   * Emit event to subscribers of a product
   * @param productId - Product ID
   * @param event - Event name
   * @param data - Event data
   */
  emitToProductSubscribers(productId: number, event: SocketEvent, data: any): void {
    if (!this.io) return;
    
    this.io.to(`product:${productId}`).emit(event, data);
    logger.debug(`Emitted event to product ${productId} subscribers: ${event}`);
  }
  
  /**
   * Emit event to subscribers of a search query
   * @param query - Search query
   * @param event - Event name
   * @param data - Event data
   */
  emitToSearchSubscribers(query: string, event: SocketEvent, data: any): void {
    if (!this.io) return;
    
    this.io.to(`search:${query}`).emit(event, data);
    logger.debug(`Emitted event to search "${query}" subscribers: ${event}`);
  }
  
  /**
   * Get number of connected clients
   */
  getConnectedClientsCount(): number {
    if (!this.io) return 0;
    
    return this.io.engine.clientsCount;
  }
  
  /**
   * Get number of authenticated users
   */
  getAuthenticatedUsersCount(): number {
    return this.userSockets.size;
  }
}

// Export singleton instance
export const socketService = new SocketService();

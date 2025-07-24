import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

/**
 * Custom hook for managing real-time messaging socket connections
 * Provides a centralized way to handle socket events and state
 * 
 * @param {string} token - JWT authentication token
 * @param {Object} options - Configuration options
 * @returns {Object} - Socket instance and state management functions
 */
const useMessagingSocket = (token, options = {}) => {
    const {
        autoConnect = true,
        serverUrl = 'http://localhost:5000',
        reconnectAttempts = 5,
        reconnectDelay = 1000,
        onAuthSuccess = null,
        onAuthError = null,
        onMessage = null,
        onUserStatusUpdate = null,
        onConnect = null,
        onDisconnect = null
    } = options;

    // Socket state
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, reconnecting
    const [currentUser, setCurrentUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [error, setError] = useState(null);

    // Refs for cleanup and management
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectCountRef = useRef(0);

    // Initialize socket connection
    useEffect(() => {
        if (!token || !autoConnect) return;

        connectSocket();

        return () => {
            disconnectSocket();
        };
    }, [token, autoConnect]);

    const connectSocket = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        setConnectionStatus('connecting');
        setError(null);

        const newSocket = io(serverUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            timeout: 10000,
            forceNew: true
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Authentication events
        newSocket.emit('authenticateMessaging', token);

        newSocket.on('messagingAuthenticated', (data) => {
            if (data.success) {
                setIsAuthenticated(true);
                setCurrentUser(data.user);
                setConnectionStatus('connected');
                reconnectCountRef.current = 0;

                console.log('Socket authenticated successfully:', data.user);

                if (onAuthSuccess) {
                    onAuthSuccess(data);
                }
            }
        });

        newSocket.on('messagingAuthError', (error) => {
            setIsAuthenticated(false);
            setError(error);
            setConnectionStatus('disconnected');

            console.error('Socket authentication failed:', error);

            if (onAuthError) {
                onAuthError(error);
            }
        });

        // Connection events
        newSocket.on('connect', () => {
            setIsConnected(true);
            setConnectionStatus('connected');
            setError(null);

            console.log('Socket connected');

            // Re-authenticate on reconnection
            if (!isAuthenticated) {
                newSocket.emit('authenticateMessaging', token);
            }

            if (onConnect) {
                onConnect();
            }
        });

        newSocket.on('disconnect', (reason) => {
            setIsConnected(false);
            setIsAuthenticated(false);

            console.log('Socket disconnected:', reason);

            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                setConnectionStatus('reconnecting');
                attemptReconnect();
            } else {
                setConnectionStatus('disconnected');
            }

            if (onDisconnect) {
                onDisconnect(reason);
            }
        });

        newSocket.on('connect_error', (error) => {
            setError(error.message);
            setConnectionStatus('reconnecting');

            console.error('Socket connection error:', error);

            attemptReconnect();
        });

        // Messaging events
        newSocket.on('newMessagingMessage', (data) => {
            console.log('New message received via socket:', data);

            if (onMessage) {
                onMessage(data);
            }
        });

        newSocket.on('messagingUserStatusUpdate', (data) => {
            console.log('User status update:', data);

            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (data.isOnline) {
                    newSet.add(data.userId);
                } else {
                    newSet.delete(data.userId);
                }
                return newSet;
            });

            if (onUserStatusUpdate) {
                onUserStatusUpdate(data);
            }
        });

        newSocket.on('userTypingInMessaging', (data) => {
            // Handle typing indicators - can be extended based on needs
            console.log('User typing:', data);
        });

        newSocket.on('messagingError', (error) => {
            setError(error);
            console.error('Messaging error:', error);
        });

        newSocket.on('messageSuccessfullySent', (message) => {
            console.log('Message sent successfully:', message);
        });
    };

    const attemptReconnect = () => {
        if (reconnectCountRef.current >= reconnectAttempts) {
            setConnectionStatus('failed');
            setError('Max reconnection attempts reached');
            return;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        const delay = reconnectDelay * Math.pow(2, reconnectCountRef.current); // Exponential backoff

        reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current += 1;
            console.log(`Reconnection attempt ${reconnectCountRef.current}/${reconnectAttempts}`);
            connectSocket();
        }, delay);
    };

    const disconnectSocket = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        setSocket(null);
        setIsConnected(false);
        setIsAuthenticated(false);
        setConnectionStatus('disconnected');
        setCurrentUser(null);
        setOnlineUsers(new Set());
        setError(null);
    };

    // Join a conversation room
    const joinConversation = (conversationId) => {
        if (socketRef.current && isAuthenticated) {
            socketRef.current.emit('joinMessagingConversation', conversationId);
            console.log(`Joined conversation: ${conversationId}`);
        }
    };

    // Leave a conversation room
    const leaveConversation = (conversationId) => {
        if (socketRef.current) {
            socketRef.current.emit('leaveMessagingConversation', conversationId);
            console.log(`Left conversation: ${conversationId}`);
        }
    };

    // Send typing indicator
    const sendTypingIndicator = (conversationId, isTyping) => {
        if (socketRef.current && isAuthenticated) {
            socketRef.current.emit('messagingTyping', {
                conversationId,
                isTyping
            });
        }
    };

    // Send message via socket
    const sendMessage = (messageData) => {
        return new Promise((resolve, reject) => {
            if (!socketRef.current || !isAuthenticated) {
                reject(new Error('Socket not connected or not authenticated'));
                return;
            }

            // Set up one-time listeners for response
            const onSuccess = (message) => {
                socketRef.current.off('messageSuccessfullySent', onSuccess);
                socketRef.current.off('messagingError', onError);
                resolve(message);
            };

            const onError = (error) => {
                socketRef.current.off('messageSuccessfullySent', onSuccess);
                socketRef.current.off('messagingError', onError);
                reject(new Error(error));
            };

            socketRef.current.on('messageSuccessfullySent', onSuccess);
            socketRef.current.on('messagingError', onError);

            // Send the message
            socketRef.current.emit('sendMessageViaSocket', messageData);

            // Set timeout for response
            setTimeout(() => {
                socketRef.current.off('messageSuccessfullySent', onSuccess);
                socketRef.current.off('messagingError', onError);
                reject(new Error('Message send timeout'));
            }, 10000);
        });
    };

    // Manual reconnect function
    const reconnect = () => {
        reconnectCountRef.current = 0;
        connectSocket();
    };

    // Check if user is online
    const isUserOnline = (userId) => {
        return onlineUsers.has(userId);
    };

    // Get connection info
    const getConnectionInfo = () => ({
        isConnected,
        isAuthenticated,
        connectionStatus,
        error,
        reconnectCount: reconnectCountRef.current,
        maxReconnectAttempts: reconnectAttempts
    });

    return {
        // Socket instance
        socket,

        // Connection state
        isConnected,
        isAuthenticated,
        connectionStatus,
        error,
        currentUser,
        onlineUsers,

        // Actions
        joinConversation,
        leaveConversation,
        sendTypingIndicator,
        sendMessage,
        reconnect,
        disconnect: disconnectSocket,

        // Utilities
        isUserOnline,
        getConnectionInfo
    };
};

export default useMessagingSocket;
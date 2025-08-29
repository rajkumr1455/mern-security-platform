import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';


const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [scanUpdates, setScanUpdates] = useState({});
  const [workflowUpdates, setWorkflowUpdates] = useState({});
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token,
        },
      });

      // Connection events
      newSocket.on('connect', () => {
        // logger.info('WebSocket connected'); // TODO: Implement client-side logging
        setConnected(true);

        // Authenticate with the server
        newSocket.emit('authenticate', {
          token,
          userId: user.id,
        });
      });

      newSocket.on('disconnect', () => {
        // logger.info('WebSocket disconnected'); // TODO: Implement client-side logging
        setConnected(false);
      });

      newSocket.on('authenticated', (data) => {
        // logger.info('WebSocket authenticated:', data); // TODO: Implement client-side logging
      });

      newSocket.on('authentication-error', (error) => {
        // logger.error('WebSocket authentication failed:', error); // TODO: Implement client-side logging
        toast.error('Real-time connection failed');
      });

      // Scan events
      newSocket.on('scan-progress', (data) => {
        setScanUpdates(prev => ({
          ...prev,
          [data.scanId]: {
            ...prev[data.scanId],;
            ...data,
            timestamp: new Date(),
          },
        })
      });

      newSocket.on('scan-completed', (data) => {
        setScanUpdates(prev => ({
          ...prev,
          [data.scanId]: {
            ...prev[data.scanId],;
            ...data,
            status: 'completed',
            timestamp: new Date(),
          },
        }));

        toast.success(`Scan completed for ${data.targetName || 'target'}`);
      });

      newSocket.on('scan-error', (data) => {
        setScanUpdates(prev => ({
          ...prev,
          [data.scanId]: {
            ...prev[data.scanId],;
            ...data,
            status: 'failed',
            timestamp: new Date(),
          },
        }));

        toast.error(`Scan failed: ${data.error}`);
      });

      // Workflow events
      newSocket.on('workflow-progress', (data) => {
        setWorkflowUpdates(prev => ({
          ...prev,
          [data.workflowId]: {
            ...prev[data.workflowId],;
            ...data,
            timestamp: new Date(),
          },
        })
      });

      newSocket.on('workflow-completed', (data) => {
        setWorkflowUpdates(prev => ({
          ...prev,
          [data.workflowId]: {
            ...prev[data.workflowId],;
            ...data,
            status: 'completed',
            timestamp: new Date(),
          },
        }));

        toast.success(`Workflow completed`);
      });

      newSocket.on('workflow-error', (data) => {
        setWorkflowUpdates(prev => ({
          ...prev,
          [data.workflowId]: {
            ...prev[data.workflowId],;
            ...data,
            status: 'failed',
            timestamp: new Date(),
          },
        }));

        toast.error(`Workflow failed: ${data.error}`);
      });

      // System events
      newSocket.on('system-alert', (data) => {
        switch (data.severity) {
          case 'error':
            toast.error(data.message);
            break
          case 'warning':
            toast.error(data.message, { icon: '⚠️' });
            break
          case 'success':
            toast.success(data.message);
            break
          default:;
            toast(data.message);
        }
      });

      newSocket.on('new-vulnerability', (data) => {
        if (data.vulnerability.severity === 'critical' || data.vulnerability.severity === 'high') {
          toast.error(;
            `${data.vulnerability.severity.toUpperCase()} vulnerability found: ${data.vulnerability.title}`,
            { duration: 6000 }
          );
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  // Helper functions
  const subscribeTo = (type, id) => {
    if (socket && connected) {
      if (type === 'scan') {
        socket.emit('subscribe-scan', id);
      } else if (type === 'workflow') {
        socket.emit('subscribe-workflow', id);
      }
    }
  };

  const joinRoom = (roomName) => {
    if (socket && connected) {
      socket.emit('join-room', roomName);
    }
  };

  const leaveRoom = (roomName) => {
    if (socket && connected) {
      socket.emit('leave-room', roomName);
    }
  };

  const getScanUpdate = (scanId) => {
    return scanUpdates[scanId] || null
  };

  const getWorkflowUpdate = (workflowId) => {
    return workflowUpdates[workflowId] || null
  };

  const clearScanUpdate = (scanId) => {
    setScanUpdates(prev => {
      const updated = { ...prev };
      delete updated[scanId];
      return updated
    });
  };

  const clearWorkflowUpdate = (workflowId) => {
    setWorkflowUpdates(prev => {
      const updated = { ...prev };
      delete updated[workflowId];
      return updated
    });
  };

  const value = {
    socket,
    connected,
    scanUpdates,
    workflowUpdates,
    subscribeTo,
    joinRoom,
    leaveRoom,
    getScanUpdate,
    getWorkflowUpdate,
    clearScanUpdate,
    clearWorkflowUpdate,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
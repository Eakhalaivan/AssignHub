import { useEffect, useState } from 'react';
import websocketService from '../websocket/websocketService';

export function useWebsocket(destination, onMessageReceived) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Listen to connection status
    const statusListener = (status) => {
      setConnected(status);
    };

    websocketService.addStatusListener(statusListener);

    // Auto-connect if not already connected
    websocketService.connect();

    let subscription = null;
    
    if (destination && onMessageReceived) {
      subscription = websocketService.subscribe(destination, onMessageReceived);
    }

    return () => {
      websocketService.removeStatusListener(statusListener);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [destination, onMessageReceived]);

  const send = (dest, body) => {
    return websocketService.send(dest, body);
  };

  return {
    connected,
    send,
  };
}

export default useWebsocket;

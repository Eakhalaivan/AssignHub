import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebsocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.statusListeners = new Set();
    this.reconnectTimeout = null;
    this.serverUrl = import.meta.env.VITE_WS_URL || '/ws';
  }

  connect(onSuccess, onError) {
    if (this.client && this.connected) {
      if (onSuccess) onSuccess();
      return;
    }

    this.reconnectAttempts = 0;
    
    // Resolve absolute WebSocket URL from relative VITE_WS_URL
    let wsUrl = this.serverUrl;
    if (wsUrl.startsWith('/')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}${wsUrl}`;
    } else {
      wsUrl = wsUrl.replace(/^http/, 'ws');
    }

    this.client = new Client({
      brokerURL: wsUrl,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.debug('[WS DEBUG]', str);
        }
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.beforeConnect = () => {
      const token = localStorage.getItem('accessToken');
      this.client.connectHeaders = {
        Authorization: token ? `Bearer ${token}` : ''
      };
      
      const attempts = this.reconnectAttempts || 0;
      // Exponential backoff capped at 30 seconds
      const delay = Math.min(30000, 1000 * Math.pow(2, attempts));
      this.client.reconnectDelay = delay;
      console.log(`[WS BEFORE_CONNECT] Attempt ${attempts + 1}, reconnect delay set to ${delay}ms`);
    };

    this.client.onConnect = (frame) => {
      this.connected = true;
      this.reconnectAttempts = 0; // reset
      this.notifyStatusListeners(true);
      console.log('[WS CONNECTED]', frame);
      if (onSuccess) onSuccess(frame);
    };

    this.client.onStompError = (frame) => {
      console.error('[WS STOMP ERROR]', frame.headers['message'], frame.body);
      this.connected = false;
      this.notifyStatusListeners(false);
      if (onError) onError(frame);
    };

    this.client.onWebSocketClose = () => {
      this.connected = false;
      this.notifyStatusListeners(false);
      this.reconnectAttempts = (this.reconnectAttempts || 0) + 1;
      console.log(`[WS DISCONNECTED] Connection lost. Reconnect attempt #${this.reconnectAttempts}`);
    };

    this.client.onDisconnect = () => {
      this.connected = false;
      this.notifyStatusListeners(false);
      console.log('[WS DEACTIVATED]');
    };

    this.client.activate();
  }

  // Subscribe to a topic or queue
  subscribe(destination, callback) {
    if (!this.client || !this.connected) {
      console.warn('[WS SUBSCRIBED FAILED] - Not connected, queueing subscription');
      // Wait for connect then subscribe
      const checkInterval = setInterval(() => {
        if (this.client && this.connected) {
          clearInterval(checkInterval);
          this.client.subscribe(destination, (message) => {
            callback(JSON.parse(message.body));
          });
        }
      }, 500);

      return {
        unsubscribe: () => clearInterval(checkInterval)
      };
    }

    const sub = this.client.subscribe(destination, (message) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (err) {
        console.error('[WS PAYLOAD ERROR]', err);
        callback(message.body);
      }
    });

    return sub;
  }

  // Send a message
  send(destination, body = {}) {
    if (!this.client || !this.connected) {
      console.error('[WS SEND FAILED] - Not connected');
      return false;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body)
    });
    return true;
  }

  // Disconnect from the WebSocket server
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.connected = false;
    this.notifyStatusListeners(false);
  }

  // Status callbacks
  addStatusListener(listener) {
    this.statusListeners.add(listener);
    listener(this.connected);
  }

  removeStatusListener(listener) {
    this.statusListeners.delete(listener);
  }

  notifyStatusListeners(status) {
    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error(err);
      }
    });
  }
}

const websocketService = new WebsocketService();
export default websocketService;
export { websocketService };

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebsocket } from '../../hooks/useWebsocket';
import { useAuthStore } from '../../store/authStore';
import { Send, MessageSquare, WifiOff, Wifi } from 'lucide-react';

/**
 * OrderChat — Real-time STOMP WebSocket chat panel for an order.
 * Props:
 *   orderId: string | number — the order ID to chat about
 */
export default function OrderChat({ orderId }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Load message history via REST
  useEffect(() => {
    if (!orderId) return;
    const token = localStorage.getItem('accessToken');
    fetch(`/api/conversations/${orderId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data && Array.isArray(data.data)) {
          setMessages(data.data);
        }
      })
      .catch(() => {}); // Silently handle if endpoint isn't available
  }, [orderId]);

  // Subscribe to live STOMP messages for this order
  const onMessage = useCallback((msg) => {
    try {
      const parsed = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg;
      setMessages(prev => [...prev, parsed]);
    } catch {
      // ignore malformed frames
    }
  }, []);

  const destination = orderId ? `/topic/order/${orderId}/messages` : null;
  const { connected, send } = useWebsocket(destination, onMessage);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const msgPayload = {
      orderId,
      senderId: user?.id,
      senderName: user?.name,
      content: text,
      sentAt: new Date().toISOString(),
    };

    // Optimistically add message locally
    setMessages(prev => [...prev, { ...msgPayload, local: true }]);
    setInput('');

    // Send via WebSocket
    send(`/app/order/${orderId}/chat`, msgPayload);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOwnMessage = (msg) => msg.senderId === user?.id || msg.senderName === user?.name;

  const formatTime = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111113] border border-white/5 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-[#c5a880]" />
          <span className="font-orbitron font-semibold text-xs text-secondary uppercase tracking-wider">
            Order Chat
          </span>
          <span className="font-mono text-[9px] text-muted">#{orderId}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {connected ? (
            <>
              <Wifi className="w-3 h-3 text-[#70a382]" />
              <span className="text-[9px] font-mono text-[#70a382] uppercase tracking-wider">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-[#cb6e6e]" />
              <span className="text-[9px] font-mono text-[#cb6e6e] uppercase tracking-wider">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 select-none">
            <MessageSquare className="w-8 h-8 text-zinc-700 mb-3" />
            <p className="text-muted text-[10px] font-mono uppercase tracking-wider text-center">
              No messages yet. Start the conversation.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const own = isOwnMessage(msg);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`flex ${own ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${own ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {!own && (
                      <span className="text-[9px] font-mono text-muted uppercase tracking-wider px-1">
                        {msg.senderName || 'User'}
                      </span>
                    )}
                    <div className={`px-3.5 py-2.5 rounded-lg text-xs leading-relaxed font-dm ${
                      own
                        ? 'bg-[#c5a880]/15 border border-[#c5a880]/25 text-primary rounded-br-sm'
                        : 'bg-white/[0.05] border border-white/5 text-secondary rounded-bl-sm'
                    }`}>
                      {msg.content || msg.message || ''}
                    </div>
                    <span className="text-[8px] font-mono text-muted px-1">
                      {formatTime(msg.sentAt || msg.createdAt)}
                      {msg.local && ' · Sending...'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 bg-[#0d0d0f] border border-white/8 rounded text-xs text-primary placeholder:text-muted font-dm resize-none outline-none px-3 py-2.5 transition-colors focus:border-[#c5a880]/30 min-h-[38px] max-h-[100px]"
            style={{ overflowY: 'auto' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 w-9 h-9 rounded bg-[#c5a880]/15 border border-[#c5a880]/30 text-[#c5a880] flex items-center justify-center hover:bg-[#c5a880]/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[8px] font-mono text-muted mt-1.5 uppercase tracking-wider">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

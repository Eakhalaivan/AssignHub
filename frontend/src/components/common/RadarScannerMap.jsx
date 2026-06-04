import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';
import { useAuthStore } from '../../store/authStore';

// PART 4 — MOCK WRITER DATA (deep copy fallback for demo mode)
const MOCK_WRITERS = [
  {
    id: 1, name: "Priya S.", fullName: "Priya Subramaniam",
    rating: 4.9, reviewCount: 128,
    spec: "UG Projects, Lab Manuals",
    services: ["Assignments", "Lab Manuals", "Record Notes", "UG Projects", "Seminar PPT"],
    status: "available",
    angle: 45, dist: 0.35,
    ordersCompleted: 342, onTimeRate: 97, repeatClients: 84,
    distance: "1.2 km", responseTime: "~10 mins", availableDays: "Mon–Sat, 9AM–9PM",
    bio: "Experienced academic writer with 4+ years helping UG students across engineering and science streams. Specialises in neat handwritten records and structured lab manuals.",
    reviews: [
      { reviewer: "Arjun K.", stars: 5, text: "Delivered my lab manual 2 days early. Very neat handwriting!", date: "2 days ago" },
      { reviewer: "Sneha M.", stars: 5, text: "Excellent quality assignment. Will definitely request again.", date: "1 week ago" }
    ]
  },
  {
    id: 2, name: "Arjun M.", fullName: "Arjun Murugan",
    rating: 4.7, reviewCount: 89,
    spec: "Assignments, Record Notes",
    services: ["Assignments", "Record Notes", "Observation Records", "Typed Docs"],
    status: "busy",
    angle: 120, dist: 0.55,
    ordersCompleted: 215, onTimeRate: 93, repeatClients: 71,
    distance: "2.8 km", responseTime: "~30 mins", availableDays: "Mon–Fri, 10AM–8PM",
    bio: "Passionate about clean, well-structured academic writing. Currently handling a few orders but accepting new requests for next-day delivery slots.",
    reviews: [
      { reviewer: "Divya T.", stars: 5, text: "Very professional. Completed my assignment overnight!", date: "3 days ago" },
      { reviewer: "Karthik R.", stars: 4, text: "Good quality, slight delay but communicated proactively.", date: "2 weeks ago" }
    ]
  },
  {
    id: 3, name: "Sneha R.", fullName: "Sneha Ramachandran",
    rating: 4.8, reviewCount: 203,
    spec: "Final Year Projects, PPT",
    services: ["Final Year Projects", "Seminar PPT", "Project Documentation", "Mini Projects"],
    status: "available",
    angle: 200, dist: 0.42,
    ordersCompleted: 178, onTimeRate: 98, repeatClients: 90,
    distance: "0.8 km", responseTime: "~5 mins", availableDays: "Every day, 8AM–10PM",
    bio: "Top-rated project documentation specialist. Helped over 170 students complete their final year projects with full documentation, PPTs and viva preparation notes.",
    reviews: [
      { reviewer: "Vijay P.", stars: 5, text: "My project report was absolutely perfect. 10/10!", date: "1 day ago" },
      { reviewer: "Meena K.", stars: 5, text: "Best PPT I have ever seen. She understood my topic immediately.", date: "5 days ago" }
    ]
  },
  {
    id: 4, name: "Karthik V.", fullName: "Karthik Venkatesh",
    rating: 4.6, reviewCount: 67,
    spec: "Hardware & IoT Projects",
    services: ["Hardware Projects", "IoT Projects", "AI/ML Projects", "Circuit Diagrams"],
    status: "available",
    angle: 290, dist: 0.68,
    ordersCompleted: 94, onTimeRate: 91, repeatClients: 78,
    distance: "3.5 km", responseTime: "~20 mins", availableDays: "Tue–Sun, 11AM–9PM",
    bio: "Electronics engineering graduate with hands-on experience building IoT prototypes and Arduino/Raspberry Pi projects. Provides complete hardware + documentation packages.",
    reviews: [
      { reviewer: "Rahul N.", stars: 5, text: "My IoT project worked perfectly on demo day. Brilliant!", date: "4 days ago" },
      { reviewer: "Priya S.", stars: 4, text: "Good hardware skills. Documentation could be more detailed.", date: "3 weeks ago" }
    ]
  },
  {
    id: 5, name: "Divya T.", fullName: "Divya Thangavel",
    rating: 4.5, reviewCount: 54,
    spec: "Diagrams, Lab Manuals",
    services: ["Diagrams", "Lab Manuals", "Observation Records", "Handwritten Notes"],
    status: "busy",
    angle: 155, dist: 0.28,
    ordersCompleted: 132, onTimeRate: 89, repeatClients: 65,
    distance: "1.9 km", responseTime: "~45 mins", availableDays: "Mon–Sat, 2PM–10PM",
    bio: "Specialises in neat engineering and science diagrams. Known for clean freehand technical illustrations and well-organised handwritten lab records.",
    reviews: [
      { reviewer: "Arjun M.", stars: 5, text: "The circuit diagrams were incredibly clean. Exactly what I needed.", date: "1 week ago" },
      { reviewer: "Sneha R.", stars: 4, text: "Good diagrams, took a little longer than expected.", date: "2 weeks ago" }
    ]
  },
  {
    id: 6, name: "Rahul N.", fullName: "Rahul Narayanan",
    rating: 4.9, reviewCount: 311,
    spec: "AI/ML Projects, Documentation",
    services: ["AI/ML Projects", "Software Projects", "Project Documentation", "Research Papers"],
    status: "available",
    angle: 330, dist: 0.75,
    ordersCompleted: 289, onTimeRate: 99, repeatClients: 92,
    distance: "4.1 km", responseTime: "~8 mins", availableDays: "Every day, 6AM–11PM",
    bio: "Machine learning engineer and academic writer with published research experience. Builds complete AI/ML project pipelines with full documentation, presentation, and viva Q&A prep.",
    reviews: [
      { reviewer: "Karthik V.", stars: 5, text: "My ML project got the highest marks in class. Absolutely incredible work!", date: "2 days ago" },
      { reviewer: "Divya T.", stars: 5, text: "Rahul went above and beyond. Highly recommended for any tech project.", date: "1 week ago" }
    ]
  },
  {
    id: 7, name: "Meena K.", fullName: "Meena Krishnaswamy",
    rating: 4.3, reviewCount: 41,
    spec: "School Assignments, Models",
    services: ["School Assignments", "Models", "Chart Work", "Handwritten Notes"],
    status: "offline",
    angle: 75, dist: 0.60,
    ordersCompleted: 76, onTimeRate: 85, repeatClients: 58,
    distance: "2.3 km", responseTime: "Usually next day", availableDays: "Mon–Fri, 3PM–8PM",
    bio: "Experienced in school-level assignments and creative working models. Especially good at science exhibition models and chart work for school fairs.",
    reviews: [
      { reviewer: "Vijay P.", stars: 4, text: "Nice working model. Helped my child a lot for the science fair.", date: "2 weeks ago" },
      { reviewer: "Rahul N.", stars: 4, text: "Decent quality, communication was a bit slow.", date: "1 month ago" }
    ]
  },
  {
    id: 8, name: "Vijay P.", fullName: "Vijay Prakash",
    rating: 4.7, reviewCount: 158,
    spec: "Software Projects, Mini Projects",
    services: ["Software Projects", "Mini Projects", "Seminar PPT", "Project Documentation"],
    status: "available",
    angle: 240, dist: 0.50,
    ordersCompleted: 201, onTimeRate: 95, repeatClients: 80,
    distance: "2.0 km", responseTime: "~15 mins", availableDays: "Mon–Sun, 9AM–9PM",
    bio: "Full-stack developer and academic project writer. Delivers complete software projects with source code, documentation, and presentation. Supports Java, Python, PHP, and web tech stacks.",
    reviews: [
      { reviewer: "Meena K.", stars: 5, text: "My mini project was delivered with full explanation. Fantastic!", date: "3 days ago" },
      { reviewer: "Priya S.", stars: 5, text: "Clean code and well-structured report. Very satisfied.", date: "1 week ago" }
    ]
  }
];

// SETUP REQUIRED:
// 1. In Supabase dashboard: create the messages table using the schema in the spec.
// 2. Enable Realtime on the messages table: Database > Replication > messages table > toggle on.
// 3. Enable Row Level Security and add policies:
//    - SELECT: auth.uid()::text = sender_id OR auth.uid()::text = receiver_id
//    - INSERT: auth.uid()::text = sender_id
//    - UPDATE: auth.uid()::text = receiver_id (for marking read)
// 4. Replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' below or in environment variables with actual project credentials.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

const STATUS_CONFIG = {
  available: { label: "Available Now", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", color: "#00c896" },
  busy: { label: "Busy", badgeClass: "bg-amber-50 text-amber-700 border-amber-200", color: "#FFA500" },
  offline: { label: "Offline", badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200", color: "#ccc" }
};

export default function RadarScannerMap({ 
  writers = [], 
  center = { lat: 13.0827, lng: 80.2707 }, 
  radius = 5.0, 
  onSelectWriter,
  isDemoMode = true 
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pingsRef = useRef([]); // Ripple rings drawn on canvas
  const lastSweptRef = useRef({}); // Timestamp when sweep passed each blip

  const { user } = useAuthStore();
  const currentStudentId = user?.id || 'student_1';
  const currentStudentRole = 'student';

  const [activeWriters, setActiveWriters] = useState([]);
  const [selectedWriter, setSelectedWriter] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0, tx: '-50%', ty: '-100%' });
  const [profileModalWriter, setProfileModalWriter] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Chat-related state
  const [activeChatWriterId, setActiveChatWriterId] = useState(null);
  const [activeChatWriterName, setActiveChatWriterName] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isWriterTyping, setIsWriterTyping] = useState(false);
  
  // Conversation list state (Messages hub)
  const [conversations, setConversations] = useState([]);
  const [isConversationsOpen, setIsConversationsOpen] = useState(false);
  const [openedFromProfile, setOpenedFromProfile] = useState(false);
  
  // Unread badge counts (mapped by writer ID or conversation ID)
  const [unreadCounts, setUnreadCounts] = useState({});
  const [chatInputText, setChatInputText] = useState('');
  const messageContainerRef = useRef(null);

  const openProfileModal = (w) => {
    setProfileModalWriter(w);
    setIsProfileModalOpen(true);
    setSelectedWriter(null); // close tooltip on profile open
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setTimeout(() => {
      setProfileModalWriter(null);
    }, 200); // match exit transition
  };

  const requestWriter = (writerId) => {
    console.log('requestWriter:', writerId);
    toast.success('Writer requested successfully!', {
      position: 'bottom-center',
      style: {
        background: '#4caf7d',
        color: '#fff',
        fontWeight: 600,
        borderRadius: '10px',
        padding: '12px 24px',
        zIndex: 9999
      },
      duration: 3000
    });
    
    // Call parent handler for compatibility if provided
    const selectedW = activeWriters.find(w => w.id === writerId);
    if (selectedW && onSelectWriter) {
      onSelectWriter(selectedW);
    }
  };

  const openChat = (writerId, writerName, fromProfile = true) => {
    // 1. If fromProfile is true, store that so clicking back arrow re-opens the profile modal
    setOpenedFromProfile(fromProfile);
    
    // Close profile modal if open
    if (fromProfile) {
      setIsProfileModalOpen(false);
    }
    
    // Close conversations list if open
    setIsConversationsOpen(false);
    
    // 2. Set activeChatWriterId = writerId, activeChatWriterName = writerName
    setActiveChatWriterId(writerId);
    setActiveChatWriterName(writerName);

    // 3. Generate conversationId = [currentStudentId, writerId].sort().join('_')
    const sortedIds = [currentStudentId.toString(), writerId.toString()].sort();
    const convId = sortedIds.join('_');
    setConversationId(convId);

    // 4. Open the chat panel
    setIsChatPanelOpen(true);
  };

  const closeChat = () => {
    setIsChatPanelOpen(false);
    if (openedFromProfile && activeChatWriterId) {
      // Find the writer object to reopen the profile modal
      const writerObj = activeWriters.find(w => w.id === activeChatWriterId);
      if (writerObj) {
        // Reopen profile modal after chat drawer starts sliding out
        setTimeout(() => {
          setProfileModalWriter(writerObj);
          setIsProfileModalOpen(true);
        }, 150);
      }
    }
  };

  const handleViewProfileFromChat = () => {
    const writerObj = activeWriters.find(w => w.id === activeChatWriterId);
    if (writerObj) {
      setIsChatPanelOpen(false);
      setTimeout(() => {
        setProfileModalWriter(writerObj);
        setIsProfileModalOpen(true);
      }, 150);
    }
  };

  const handleSendClick = () => {
    const text = chatInputText.trim();
    if (!text) return;
    sendMessage(text);
    setChatInputText('');
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const msgDate = new Date(dateStr);
      const now = new Date();
      const diffMs = now - msgDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const updateUnreadCountsMap = (allMsgs) => {
    const counts = {};
    allMsgs.forEach((m) => {
      if (m.receiver_id === currentStudentId.toString() && !m.is_read) {
        counts[m.conversation_id] = (counts[m.conversation_id] || 0) + 1;
      }
    });
    setUnreadCounts(counts);
  };

  const loadConversationsList = () => {
    try {
      const stored = localStorage.getItem('academix_conversations');
      if (stored) {
        setConversations(JSON.parse(stored));
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setConversations([]);
    }
  };

  const updateConversationSummary = (msg) => {
    try {
      const stored = localStorage.getItem('academix_conversations');
      let convs = stored ? JSON.parse(stored) : [];
      
      const convIndex = convs.findIndex(c => c.conversation_id === msg.conversation_id);
      
      // Find writer details
      const writerId = msg.sender_role === 'writer' ? parseInt(msg.sender_id) : parseInt(msg.receiver_id);
      const writerObj = MOCK_WRITERS.find(mw => mw.id === writerId) || {};
      
      const newSummary = {
        conversation_id: msg.conversation_id,
        writer_id: writerId,
        writer_name: writerObj.name || activeChatWriterName || 'Expert Writer',
        last_message: msg.content,
        timestamp: msg.created_at,
        unread_count: msg.sender_role === 'writer' && (!isChatPanelOpen || conversationId !== msg.conversation_id) ? 1 : 0
      };

      if (convIndex !== -1) {
        const existing = convs[convIndex];
        newSummary.unread_count = msg.sender_role === 'writer' && (!isChatPanelOpen || conversationId !== msg.conversation_id)
          ? (existing.unread_count || 0) + 1 
          : 0;
        convs.splice(convIndex, 1);
      }
      
      convs.unshift(newSummary);
      localStorage.setItem('academix_conversations', JSON.stringify(convs));
      loadConversationsList();
    } catch (err) {
      console.error('Failed to update conversation summary:', err);
    }
  };

  const loadLocalStorageHistory = () => {
    try {
      const stored = localStorage.getItem('academix_chat_messages');
      if (stored) {
        const allMsgs = JSON.parse(stored);
        const filtered = allMsgs.filter((m) => m.conversation_id === conversationId);
        
        // Mark all messages to us as read
        const updatedAll = allMsgs.map((m) => {
          if (m.conversation_id === conversationId && m.receiver_id === currentStudentId.toString()) {
            return { ...m, is_read: true };
          }
          return m;
        });
        localStorage.setItem('academix_chat_messages', JSON.stringify(updatedAll));
        updateUnreadCountsMap(updatedAll);
        
        // Update summaries to reset unread count for this conversation
        const summariesStr = localStorage.getItem('academix_conversations');
        if (summariesStr) {
          const summaries = JSON.parse(summariesStr);
          const updatedSummaries = summaries.map(c => 
            c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c
          );
          localStorage.setItem('academix_conversations', JSON.stringify(updatedSummaries));
          loadConversationsList();
        }

        setChatMessages(filtered);
      } else {
        setChatMessages([]);
      }
    } catch (err) {
      console.error('LocalStorage load failed:', err);
      setChatMessages([]);
    }
  };

  const saveLocalStorageMessage = (msg) => {
    try {
      const stored = localStorage.getItem('academix_chat_messages');
      const allMsgs = stored ? JSON.parse(stored) : [];
      allMsgs.push(msg);
      localStorage.setItem('academix_chat_messages', JSON.stringify(allMsgs));
      updateUnreadCountsMap(allMsgs);
    } catch (err) {
      console.error('LocalStorage save message failed:', err);
    }
  };

  const triggerDemoAutoReply = (studentMsg) => {
    const writerId = activeChatWriterId;
    const writerName = activeChatWriterName;
    const convId = conversationId;
    
    if (!writerId) return;

    setTimeout(() => {
      setConversationId((currentConvId) => {
        if (currentConvId === convId) {
          setIsWriterTyping(true);
        }
        return currentConvId;
      });
    }, 1000);

    setTimeout(() => {
      setConversationId((currentConvId) => {
        if (currentConvId !== convId) return currentConvId;
        
        setIsWriterTyping(false);

        const writerMatch = MOCK_WRITERS.find((mw) => mw.id === writerId) || {};
        let replyContent = `Hi! Thanks for messaging. I received your request and am checking the details now. Let me know if you have specific rubrics or a deadline.`;
        
        if (writerId === 1) {
          replyContent = `Hi! I can definitely help with your lab manual/record note request. My handwriting is clean, and I can draw neat diagrams. Do you need standard engineering or science format?`;
        } else if (writerId === 2) {
          replyContent = `Hello! I'm currently wrapping up a mini assignment, but I can definitely fit in your request. I can start working on it by tonight. Send over the problem statement!`;
        } else if (writerId === 3) {
          replyContent = `Hi there! Final year project documentation is my main area. I can provide the documentation, presentation slides, and also help prepare for the viva. When is your project review?`;
        } else if (writerId === 4) {
          replyContent = `Hey! I'm ready to design your IoT circuit. I work with Arduino, ESP32, and Raspberry Pi. Do you need a complete hardware setup or just the simulation and documentation?`;
        } else if (writerId === 5) {
          replyContent = `Hi! I can draft clean freehand circuit or technical diagrams for your lab record. Do you need them in pencil or dark ink? Send me the reference images.`;
        } else if (writerId === 6) {
          replyContent = `Hey! I build full AI/ML models (Python, PyTorch, Scikit-learn). I can build the pipeline, generate graphs for your report, and explain the code. What dataset are we using?`;
        } else if (writerId === 7) {
          replyContent = `Hello! I specialize in school-level working models and chart decorations. What topic is your child's science fair assignment on? I have a few creative ideas.`;
        } else if (writerId === 8) {
          replyContent = `Hi! I write full-stack software mini projects (Java, Spring, Python, PHP). I'll deliver the clean source code, database design, and presentation slides. What stack are you thinking?`;
        }

        const replyMsg = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          conversation_id: convId,
          sender_id: writerId.toString(),
          sender_role: 'writer',
          receiver_id: currentStudentId.toString(),
          content: replyContent,
          is_read: isChatPanelOpen,
          created_at: new Date().toISOString()
        };

        setChatMessages((prev) => [...prev, replyMsg]);
        saveLocalStorageMessage(replyMsg);
        updateConversationSummary(replyMsg);

        if (!isChatPanelOpen) {
          toast.success(`${writerName}: "${replyContent.substring(0, 40)}..."`, {
            position: 'bottom-center',
            duration: 4000,
            style: {
              background: '#4caf7d',
              color: '#fff',
              fontWeight: 600,
              borderRadius: '10px',
              zIndex: 99999
            }
          });
        }

        return currentConvId;
      });
    }, 3500);
  };

  const markMessageFailed = (msgId) => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, failed: true } : m))
    );
  };

  const retryMessage = async (msgObj) => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === msgObj.id ? { ...m, failed: false } : m))
    );
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from('messages')
          .insert([
            {
              id: msgObj.id,
              conversation_id: msgObj.conversation_id,
              sender_id: msgObj.sender_id,
              sender_role: msgObj.sender_role,
              receiver_id: msgObj.receiver_id,
              content: msgObj.content,
              is_read: false,
              created_at: msgObj.created_at
            }
          ]);
        if (error) throw error;
      } catch (err) {
        console.error('Retry failed:', err);
        markMessageFailed(msgObj.id);
      }
    }
  };

  const sendMessage = async (textContent) => {
    const text = textContent.trim();
    if (!text || text.length > 1000) return;

    const newMessageId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const newMsg = {
      id: newMessageId,
      conversation_id: conversationId,
      sender_id: currentStudentId.toString(),
      sender_role: 'student',
      receiver_id: activeChatWriterId.toString(),
      content: text,
      is_read: false,
      created_at: new Date().toISOString()
    };

    setChatMessages((prev) => [...prev, newMsg]);

    if (supabase) {
      try {
        const { error } = await supabase
          .from('messages')
          .insert([
            {
              id: newMsg.id,
              conversation_id: newMsg.conversation_id,
              sender_id: newMsg.sender_id,
              sender_role: newMsg.sender_role,
              receiver_id: newMsg.receiver_id,
              content: newMsg.content,
              is_read: false,
              created_at: newMsg.created_at
            }
          ]);
        if (error) throw error;
      } catch (err) {
        console.error('Supabase send failed, saving locally:', err);
        markMessageFailed(newMsg.id);
      }
    } else {
      saveLocalStorageMessage(newMsg);
      triggerDemoAutoReply(newMsg);
    }
    
    updateConversationSummary(newMsg);
  };

  const getMessageDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const msgDate = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      if (msgDate.toDateString() === today.toDateString()) {
        return 'Today';
      }
      if (msgDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      
      return msgDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const formatMsgTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  const sanitizeHTML = (text) => {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Listen for Escape key to close tooltip, modal, or chats
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isChatPanelOpen) {
          closeChat();
        } else if (isConversationsOpen) {
          setIsConversationsOpen(false);
        } else if (isProfileModalOpen) {
          closeProfileModal();
        } else if (selectedWriter) {
          setSelectedWriter(null);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isProfileModalOpen, selectedWriter, isChatPanelOpen, isConversationsOpen, activeChatWriterId]);

  // Load conversation summaries and unread counts on mount
  useEffect(() => {
    loadConversationsList();
    try {
      const stored = localStorage.getItem('academix_chat_messages');
      if (stored) {
        updateUnreadCountsMap(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Unread counts load on mount failed:', err);
    }
  }, []);

  // Auto scroll effect
  useEffect(() => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      if (isNearBottom || chatMessages.length <= 1) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [chatMessages, isWriterTyping]);

  useEffect(() => {
    if (isChatPanelOpen) {
      const timer = setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isChatPanelOpen]);

  // 4. Message History & Real-Time Sync Effect
  useEffect(() => {
    if (!conversationId) return;

    let supabaseSubscription = null;
    setIsMessagesLoading(true);
    
    if (supabase) {
      const fetchSupabaseHistory = async () => {
        setIsReconnecting(false);
        try {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(50);
            
          if (error) throw error;
          setChatMessages(data || []);
          
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .eq('receiver_id', currentStudentId.toString());
            
        } catch (err) {
          console.error('Supabase history fetch failed, falling back to LocalStorage:', err);
          loadLocalStorageHistory();
        } finally {
          setIsMessagesLoading(false);
        }
      };

      fetchSupabaseHistory();

      supabaseSubscription = supabase
        .channel(`chat:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const newMsg = payload.new;
            setChatMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            
            if (newMsg.receiver_id === currentStudentId.toString()) {
              supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', newMsg.id);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsReconnecting(false);
          } else {
            setIsReconnecting(true);
          }
        });
    } else {
      loadLocalStorageHistory();
      setIsMessagesLoading(false);
    }

    return () => {
      if (supabaseSubscription) {
        supabase.removeChannel(supabaseSubscription);
      }
    };
  }, [conversationId]);

  // 1. Populate writers based on demo or live mode
  useEffect(() => {
    const VALID_STATUSES = new Set(['available', 'busy', 'offline']);
    const normaliseStatus = (raw) => {
      if (!raw) return 'offline';
      const s = String(raw).toLowerCase();
      if (s === 'available' || s === 'true') return 'available';
      if (s === 'busy' || s === 'in_progress') return 'busy';
      if (VALID_STATUSES.has(s)) return s;
      return 'offline';
    };

    if (isDemoMode) {
      // Assign stable, deterministic angle based on writer id if not already present
      setActiveWriters(writers.map((w, idx) => {
        const mockMatch = MOCK_WRITERS.find(mw => mw.id === w.id || mw.name === w.name) || {};
        return {
          ...mockMatch,
          ...w,
          status: normaliseStatus(w.status),
          // Polar position: use existing values or spread writers evenly around the radar
          angle: (typeof w.angle === 'number' && !isNaN(w.angle)) ? w.angle : (typeof mockMatch.angle === 'number') ? mockMatch.angle : (idx * (360 / Math.max(writers.length, 1))) % 360,
          dist: (typeof w.dist === 'number' && !isNaN(w.dist) && w.dist > 0)
            ? w.dist
            : (typeof mockMatch.dist === 'number') ? mockMatch.dist
            : w.distanceKm ? Math.min(w.distanceKm / Math.max(radius, 1), 0.9)
            : 0.25 + (idx % 5) * 0.12,
          initials: w.initials || mockMatch.initials || w.name?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'W',
          degree: w.degree || mockMatch.spec?.split(', ')[0] || w.spec?.split(', ')[0] || 'Expert Writer',
          specializations: w.specializations || mockMatch.services || w.spec?.split(', ') || ['Academic Writing'],
          distanceKm: w.distanceKm || (w.dist ? w.dist * radius : (0.25 + (idx % 5) * 0.12) * radius),
          rating: w.rating || mockMatch.rating || 5.0,
          bio: w.bio || mockMatch.bio || `Professional academic expert specializing in ${w.spec || 'academic work'}.`
        };
      }));
    } else {
      // Map server-polled writers list
      setActiveWriters(writers.map(w => {
        const mockMatch = MOCK_WRITERS.find(mw => mw.id === w.id || mw.name === w.name) || {};
        const rawStatus = w.status || (w.isAvailable === true ? 'available' : w.isAvailable === false ? 'busy' : undefined);
        return {
          ...mockMatch,
          ...w,
          id: w.id,
          name: w.name || 'Writer',
          rating: w.rating || mockMatch.rating || 5.0,
          spec: w.specializations?.join(', ') || w.spec || mockMatch.spec || 'Academic Writing',
          status: normaliseStatus(rawStatus),
          angle: w.angle || mockMatch.angle || Math.random() * 360,
          dist: w.dist || mockMatch.dist || (w.distanceKm ? w.distanceKm / radius : 0.5),
          latitude: w.latitude,
          longitude: w.longitude,
          distanceKm: w.distanceKm || mockMatch.distanceKm,
          initials: w.initials || mockMatch.initials || w.name?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'W',
          degree: w.degree || w.specializations?.[0] || mockMatch.spec?.split(', ')[0] || 'Expert Writer',
          specializations: w.specializations || mockMatch.services || ['Academic Writing'],
          bio: w.bio || mockMatch.bio || 'Available for matching and research delivery.'
        };
      }));
    }
  }, [writers, isDemoMode, radius]);

  // Coordinate mapper from writer coordinates to radar screen positions
  const getCoordinates = (w, size) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = (size / 2) - 12;

    let x, y;

    if (isDemoMode || !w.latitude) {
      // Demo polar coordinates mapping
      const angle = (typeof w.angle === 'number' && !isNaN(w.angle)) ? w.angle : 0;
      const dist  = (typeof w.dist  === 'number' && !isNaN(w.dist)  && w.dist > 0) ? w.dist : 0.5;
      const angleRad = (angle - 90) * Math.PI / 180;
      x = centerX + maxRadius * dist * Math.cos(angleRad);
      y = centerY + maxRadius * dist * Math.sin(angleRad);
    } else {
      // Live coordinates offsets mapping relative to center coordinates
      const latDiff = w.latitude - center.lat;
      const lngDiff = w.longitude - center.lng;
      // Linear scaling: let 0.05 lat/lon degree (~5km) map to radar boundaries
      const maxOffset = 0.05;
      const dx = (lngDiff / maxOffset) * maxRadius;
      const dy = -(latDiff / maxOffset) * maxRadius; // Invert Y for screen

      const dist = Math.sqrt(dx * dx + dy * dy);
      let fx = dx;
      let fy = dy;
      if (dist > maxRadius) {
        fx = (dx / dist) * maxRadius;
        fy = (dy / dist) * maxRadius;
      }
      x = centerX + fx;
      y = centerY + fy;
    }

    // Safety guard: if anything produced NaN, fall back to centre
    if (!isFinite(x) || isNaN(x)) x = centerX;
    if (!isFinite(y) || isNaN(y)) y = centerY;

    return { x, y };
  };

  // 2. Main Canvas Loop: Sonar sweep rotation and ring drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let sweepAngle = 0;
    const size = 320;

    // HiDPI context scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = (size / 2) - 12;

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // A. Draw Concentric sonars (5 circles)
      ctx.strokeStyle = 'rgba(232, 160, 160, 0.25)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (maxRadius / 5) * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      // B. Draw Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.stroke();

      // C. Draw perimeter tick marks (every 5 degrees)
      ctx.strokeStyle = 'rgba(232, 160, 160, 0.4)';
      for (let a = 0; a < 360; a += 5) {
        const rad = (a * Math.PI) / 180;
        const isMajor = a % 30 === 0;
        const tickLen = isMajor ? 6 : 3;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(rad) * (maxRadius - tickLen), centerY + Math.sin(rad) * (maxRadius - tickLen));
        ctx.lineTo(centerX + Math.cos(rad) * maxRadius, centerY + Math.sin(rad) * maxRadius);
        ctx.stroke();
      }

      // D. Draw rotating fading sweep arm sector
      const sweepWidth = 35;
      const numSegments = 50;
      for (let i = 0; i < numSegments; i++) {
        const segmentAngle = sweepAngle - (i * (sweepWidth / numSegments)) * Math.PI / 180;
        const opacity = 0.22 * (1 - i / numSegments);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, maxRadius, segmentAngle - 0.01, segmentAngle, false);
        ctx.closePath();
        ctx.fillStyle = `rgba(232, 160, 160, ${opacity})`;
        ctx.fill();
      }

      // Brighter leading edge sweep line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + maxRadius * Math.cos(sweepAngle), centerY + maxRadius * Math.sin(sweepAngle));
      ctx.strokeStyle = 'rgba(232, 160, 160, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Increment rotation
      sweepAngle = (sweepAngle + 0.022) % (Math.PI * 2);

      // E. Draw expanding canvas pings (simulation ripples)
      pingsRef.current.forEach((ping, idx) => {
        ping.radius += 1.8;
        ping.alpha = 1.0 - (ping.radius / ping.maxRadius);

        if (ping.alpha <= 0) {
          pingsRef.current.splice(idx, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(232, 160, 160, ${ping.alpha * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // F. Collision Check (Mark blip swept timestamps)
      activeWriters.forEach(w => {
        const { x, y } = getCoordinates(w, size);
        const dx = x - centerX;
        const dy = y - centerY;
        let blipAngle = Math.atan2(dy, dx);
        if (blipAngle < 0) blipAngle += Math.PI * 2;

        let delta = sweepAngle - blipAngle;
        if (delta < 0) delta += Math.PI * 2;

        if (delta >= 0 && delta < 0.2) {
          lastSweptRef.current[w.id] = Date.now();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeWriters, center]);

  // 3. Periodic Simulation Ping Routine (New mock available writers)
  useEffect(() => {
    const triggerPing = () => {
      // Choose an offline mock writer or add a new mock writer
      let targetWriter = null;
      
      setActiveWriters(prev => {
        const offlineIdx = prev.findIndex(w => w.status === 'offline');
        let updated = [...prev];
        
        if (offlineIdx !== -1) {
          const distVal = 0.2 + Math.random() * 0.6;
          updated[offlineIdx] = {
            ...updated[offlineIdx],
            status: 'available',
            angle: Math.floor(Math.random() * 360),
            dist: distVal,
            distanceKm: distVal * radius
          };
          targetWriter = updated[offlineIdx];
        } else {
          // Add a new mock writer
          const nextId = updated.length + 1;
          const firstNames = ["Siddharth", "Aishwarya", "Ananya", "Rohan", "Vikram", "Tanvi"];
          const lastNames = ["R.", "K.", "S.", "M.", "V.", "N."];
          const newName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
          
          const specText = "Research Reports, Mini Projects";
          const distVal = 0.2 + Math.random() * 0.6;
          const newW = {
            id: nextId,
            name: newName,
            fullName: `${newName.split(' ')[0]} ${newName.split(' ')[1] || ''}`,
            rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
            reviewCount: Math.floor(20 + Math.random() * 100),
            spec: specText,
            services: ["Assignments", "Lab Manuals", "Mini Projects", "Research Reports"],
            status: "available",
            angle: Math.floor(Math.random() * 360),
            dist: distVal,
            ordersCompleted: Math.floor(50 + Math.random() * 200),
            onTimeRate: Math.floor(88 + Math.random() * 12),
            repeatClients: Math.floor(60 + Math.random() * 30),
            distance: `${(distVal * radius).toFixed(1)} km`,
            responseTime: "~15 mins",
            availableDays: "Mon–Sat, 9AM–9PM",
            initials: newName.split(' ').map(n=>n[0]).join('').toUpperCase(),
            degree: specText.split(', ')[0],
            specializations: specText.split(', '),
            distanceKm: distVal * radius,
            bio: `Professional academic expert specializing in ${specText}.`,
            reviews: [
              { reviewer: "Student A.", stars: 5, text: "Very prompt and professional work.", date: "3 days ago" },
              { reviewer: "Student B.", stars: 4, text: "Good quality documents.", date: "1 week ago" }
            ]
          };

          if (!isDemoMode) {
            const latOffset = (Math.random() - 0.5) * 0.07;
            const lonOffset = (Math.random() - 0.5) * 0.07;
            newW.latitude = center.lat + latOffset;
            newW.longitude = center.lng + lonOffset;
          }

          updated.push(newW);
          targetWriter = newW;
        }

        return updated;
      });

      // Dispatch canvas ripple circles
      setTimeout(() => {
        if (targetWriter) {
          const coords = getCoordinates(targetWriter, 320);
          pingsRef.current.push({
            x: coords.x,
            y: coords.y,
            radius: 6,
            maxRadius: 75,
            alpha: 1.0
          });
        }
      }, 50);
    };

    const delay = 8000 + Math.random() * 4000;
    const interval = setInterval(triggerPing, delay);

    return () => clearInterval(interval);
  }, [isDemoMode, center, radius]);

  // Click on a blip shows the detailed tooltip popover
  const handleBlipClick = (w, coords, e) => {
    e.stopPropagation();
    setSelectedWriter(w);

    const size = 320;
    const tooltipWidth = 260; // estimate tooltip width
    const tooltipHeight = 130; // estimate tooltip height
    
    let left = coords.x;
    let top = coords.y - 12;
    let tx = '-50%';
    let ty = '-100%';

    // Overflow check boundaries
    if (left - tooltipWidth / 2 < 0) {
      left = tooltipWidth / 2 + 8;
    }
    if (left + tooltipWidth / 2 > size) {
      left = size - (tooltipWidth / 2) - 8;
    }
    if (top - tooltipHeight < 0) {
      top = coords.y + 12;
      ty = '0%';
    }

    setTooltipPos({ left, top, tx, ty });

    // Click anywhere else closes tooltip
    const closeTooltip = () => {
      setSelectedWriter(null);
      document.removeEventListener('click', closeTooltip);
    };
    document.addEventListener('click', closeTooltip);
  };

  // Close tooltip helper
  const handleRequestClick = (w) => {
    if (onSelectWriter) {
      onSelectWriter(w);
    }
    setSelectedWriter(null);
  };

  return (
    <div className="flex flex-col items-center justify-center select-none w-full">
      
      {/* Stylesheet Injection for pulsing animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes radar-blip-pulse {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.65; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        .radar-tooltip-btn:hover {
          background-color: #d06060 !important;
        }
        .radar-view-profile-link:hover {
          text-decoration: underline !important;
          color: #1e1e24 !important;
        }
        .modal-close-btn:hover {
          background-color: rgba(0, 0, 0, 0.1) !important;
        }
        .modal-action-msg-btn:hover {
          background-color: #e8f5ee !important;
        }
        .modal-action-req-btn:hover {
          background-color: #d06060 !important;
        }
        @keyframes avatar-ring-pulse {
          0% { box-shadow: 0 0 0 0px rgba(76, 175, 125, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(76, 175, 125, 0); }
          100% { box-shadow: 0 0 0 0px rgba(76, 175, 125, 0); }
        }

        /* Typing Bouncing Indicator */
        @keyframes typing-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          background-color: #888888;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
          animation: typing-bounce 1s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        /* Scrollbar styles for messages container */
        .chat-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll-container::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }
        .chat-scroll-container::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.25);
        }

        /* Chat Backdrop Animation */
        .drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.45);
          z-index: 99990;
          transition: opacity 0.3s ease-out;
        }

        /* Drawer Slide-In Animation */
        .drawer-panel {
          position: fixed;
          top: 0;
          right: 0;
          height: 100%;
          background-color: #ffffff;
          box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
          z-index: 99995;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Inbox Floating Hub Button Hover */
        .floating-inbox-btn {
          transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
        }
        .floating-inbox-btn:hover {
          transform: scale(1.08);
          background-color: #e56b6b !important;
          box-shadow: 0 8px 24px rgba(224, 122, 122, 0.45) !important;
        }
        .floating-inbox-btn:active {
          transform: scale(0.95);
        }
      `}} />

      <div className="relative rounded-[32px] bg-[#fcfbfa] p-6 border border-zinc-200/60 shadow-lg text-[#1e1e24] w-full max-w-[368px]">
        
        {/* Sonar Canvas Container */}
        <div ref={containerRef} className="relative aspect-square w-full rounded-full flex items-center justify-center overflow-visible bg-[#fcfbfa]">
          <canvas
            ref={canvasRef}
            className="rounded-full shadow-inner border border-zinc-100"
          />

          {/* Absolute Blips Overlay */}
          <div className="absolute inset-0 rounded-full overflow-visible pointer-events-none z-10">
            {activeWriters.map(w => {
              const coords = getCoordinates(w, 320);
              const config = STATUS_CONFIG[w.status] || STATUS_CONFIG['offline'];
              const timeSinceSwept = Date.now() - (lastSweptRef.current[w.id] || 0);
              const isSwept = timeSinceSwept < 500;

              return (
                <div
                  key={w.id}
                  onClick={(e) => handleBlipClick(w, coords, e)}
                  className="absolute w-4 h-4 translate-x-[-50%] translate-y-[-50%] pointer-events-auto cursor-pointer"
                  style={{ left: coords.x, top: coords.y }}
                >
                  {/* Glowing halo ring */}
                  {w.status !== 'offline' && (
                    <div 
                      className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: config.color,
                        animation: 'radar-blip-pulse 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite'
                      }}
                    />
                  )}
                  {/* Outer circle decoration */}
                  <div 
                    className="absolute top-1/2 left-1/2 rounded-full border opacity-20 pointer-events-none translate-x-[-50%] translate-y-[-50%]"
                    style={{
                      width: '18px',
                      height: '18px',
                      borderColor: config.color,
                      transform: isSwept ? 'translate(-50%, -50%) scale(1.3)' : 'translate(-50%, -50%) scale(1)',
                      transition: 'transform 0.2s'
                    }}
                  />
                  {/* Core blip dot */}
                  <div
                    className="absolute top-1/2 left-1/2 rounded-full translate-x-[-50%] translate-y-[-50%]"
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: config.color,
                      boxShadow: `0 0 6px ${config.color}`,
                      transform: isSwept ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%) scale(1)',
                      filter: isSwept ? 'brightness(1.5)' : 'brightness(1)',
                      transition: 'transform 0.15s, filter 0.15s'
                    }}
                  />
                </div>
              );
            })}

            {/* Sonar popover tooltip */}
            {selectedWriter && (
              <div 
                className="absolute pointer-events-auto z-30 text-left transition-all duration-200"
                style={{
                  left: tooltipPos.left,
                  top: tooltipPos.top,
                  transform: `translate(${tooltipPos.tx}, ${tooltipPos.ty})`,
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)',
                  backgroundColor: '#ffffff',
                  minWidth: '260px',
                  padding: '16px 20px',
                  border: '1px solid #f0edf0',
                  color: '#1e1e24',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Row 1: Name & Rating */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '17px', fontWeight: 700, color: '#1e1e24' }}>
                    {selectedWriter.name}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e1e24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    ⭐{selectedWriter.rating.toFixed(1)}
                  </span>
                </div>

                {/* Row 2: Status pill & Request Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
                  {/* Status Badge Pill */}
                  {(() => {
                    let label = "OFFLINE";
                    let color = "#999";
                    if (selectedWriter.status === "available") {
                      label = "AVAILABLE NOW";
                      color = "#4caf7d";
                    } else if (selectedWriter.status === "busy") {
                      label = "BUSY";
                      color = "#FFA500";
                    }
                    return (
                      <span style={{
                        border: `1.5px solid ${color}`,
                        color: color,
                        background: 'transparent',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        display: 'inline-block',
                        whiteSpace: 'nowrap'
                      }}>
                        {label}
                      </span>
                    );
                  })()}

                  {/* Request Button */}
                  <button 
                    type="button"
                    onClick={() => {
                      openProfileModal(selectedWriter);
                    }}
                    className="radar-tooltip-btn"
                    style={{
                      backgroundColor: '#e07a7a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '8px 16px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Request Writer →
                  </button>
                </div>

                {/* Row 3: View Profile Link */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      openProfileModal(selectedWriter);
                    }}
                    className="radar-view-profile-link"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#888888',
                      fontSize: '12px',
                      cursor: 'pointer',
                      padding: '2px 8px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      outline: 'none'
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-5 text-[10px] font-medium text-zinc-500 border-t border-zinc-100 pt-4">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c896] block" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFA500] block" />
            <span>Busy</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccc] block" />
            <span>Offline</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between text-[9px] font-mono font-bold text-zinc-400 mt-3 pt-1 border-t border-zinc-50/50">
          <span>RADIUS: {isDemoMode ? "Mock Area" : `~${radius} km`}</span>
          <span>COUNT: {activeWriters.filter(w => w.status !== 'offline').length} Nearby</span>
        </div>

      </div>

      {/* Full Writer Profile View Modal Overlay */}
      {profileModalWriter && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            zIndex: 9999, // use a high zIndex so it sits above sidebar, radar, and other UI layers
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isProfileModalOpen ? 1 : 0,
            transition: 'opacity 0.25s ease-out',
            pointerEvents: isProfileModalOpen ? 'auto' : 'none',
          }}
          onClick={closeProfileModal}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              width: '92vw',
              maxWidth: '480px',
              maxHeight: '88vh',
              borderRadius: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              opacity: isProfileModalOpen ? 1 : 0,
              transform: isProfileModalOpen ? 'scale(1)' : 'scale(0.92)',
              transition: 'transform 0.25s ease-out, opacity 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeProfileModal}
              className="modal-close-btn"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                color: '#555555',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 30,
                transition: 'background-color 0.2s',
              }}
            >
              ✕
            </button>

            {/* Section A: Header / Identity */}
            <div style={{
              padding: '32px 24px 20px 24px',
              background: profileModalWriter.status === 'available' 
                ? 'linear-gradient(135deg, #e8f5ee 0%, #ffffff 100%)' 
                : profileModalWriter.status === 'busy' 
                ? 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)' 
                : 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
              borderBottom: '1px solid #f0edf0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: profileModalWriter.status === 'available' 
                      ? '#4caf7d' 
                      : profileModalWriter.status === 'busy' 
                      ? '#FFA500' 
                      : '#999999',
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    animation: profileModalWriter.status === 'available' ? 'avatar-ring-pulse 2s infinite' : 'none',
                  }}
                >
                  {profileModalWriter.initials || 'W'}
                </div>
                
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1e24', margin: 0 }}>
                    {profileModalWriter.fullName || profileModalWriter.name}
                  </h2>
                  
                  {/* Status indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: profileModalWriter.status === 'available' 
                        ? '#4caf7d' 
                        : profileModalWriter.status === 'busy' 
                        ? '#FFA500' 
                        : '#999999',
                      display: 'inline-block'
                    }} />
                    <span style={{ 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: profileModalWriter.status === 'available' 
                        ? '#3e8c64' 
                        : profileModalWriter.status === 'busy' 
                        ? '#cc8400' 
                        : '#666666' 
                    }}>
                      {profileModalWriter.status === 'available' 
                        ? 'Available Now' 
                        : profileModalWriter.status === 'busy' 
                        ? 'Busy — Est. free in 2h' 
                        : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specialization tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {(profileModalWriter.specializations || []).map((tag, idx) => (
                  <span 
                    key={idx} 
                    style={{
                      backgroundColor: '#f1eff1',
                      color: '#44444c',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '12px'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Rating display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{ color: '#ffb400', fontSize: '16px', letterSpacing: '2px' }}>
                  {'★'.repeat(Math.round(profileModalWriter.rating || 5)) + '☆'.repeat(5 - Math.round(profileModalWriter.rating || 5))}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e1e24' }}>
                  {profileModalWriter.rating?.toFixed(1) || '5.0'}
                </span>
                <span style={{ fontSize: '13px', color: '#888888' }}>
                  ({profileModalWriter.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            {/* Section B: Stats Row */}
            <div style={{
              display: 'flex',
              backgroundColor: '#f7f7f7',
              padding: '16px 20px',
              borderBottom: '1px solid #f0edf0',
              justifyContent: 'space-between',
              textAlign: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e1e24' }}>
                  {profileModalWriter.ordersCompleted || 0}
                </div>
                <div style={{ fontSize: '11px', color: '#888888', marginTop: '2px', fontWeight: 500 }}>
                  Orders Done
                </div>
              </div>
              
              <div style={{ width: '1px', backgroundColor: '#e2e0e2', alignSelf: 'stretch' }} />

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e1e24' }}>
                  {profileModalWriter.onTimeRate || 100}%
                </div>
                <div style={{ fontSize: '11px', color: '#888888', marginTop: '2px', fontWeight: 500 }}>
                  On-Time Rate
                </div>
              </div>

              <div style={{ width: '1px', backgroundColor: '#e2e0e2', alignSelf: 'stretch' }} />

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e1e24' }}>
                  {profileModalWriter.repeatClients || 0}%
                </div>
                <div style={{ fontSize: '11px', color: '#888888', marginTop: '2px', fontWeight: 500 }}>
                  Repeat Clients
                </div>
              </div>
            </div>

            {/* Section C: About / Bio */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0edf0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888888', marginBottom: '8px' }}>
                About
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#444444', margin: 0 }}>
                {profileModalWriter.bio}
              </p>
            </div>

            {/* Section D: Services Offered */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0edf0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888888', marginBottom: '12px' }}>
                Services
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(profileModalWriter.services || []).map((service, idx) => (
                  <span 
                    key={idx} 
                    style={{
                      backgroundColor: '#e8f5ee',
                      color: '#3a8a5a',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '5px 14px',
                      borderRadius: '20px'
                    }}
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Section E: Availability & Location */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0edf0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888888', marginBottom: '12px' }}>
                Availability
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#333333' }}>
                  <span style={{ fontSize: '16px' }}>📍</span>
                  <span style={{ fontWeight: 600, width: '110px' }}>Distance:</span>
                  <span>{profileModalWriter.distance || '1.2 km'} away</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#333333' }}>
                  <span style={{ fontSize: '16px' }}>🕐</span>
                  <span style={{ fontWeight: 600, width: '110px' }}>Response Time:</span>
                  <span>Usually replies in {profileModalWriter.responseTime || '~10 mins'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#333333' }}>
                  <span style={{ fontSize: '16px' }}>📅</span>
                  <span style={{ fontWeight: 600, width: '110px' }}>Available Days:</span>
                  <span>{profileModalWriter.availableDays || 'Mon – Sat, 9AM – 9PM'}</span>
                </div>
              </div>
            </div>

            {/* Section F: Reviews */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0edf0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888888', marginBottom: '16px' }}>
                Recent Reviews
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(profileModalWriter.reviews || []).slice(0, 2).map((rev, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#e8f5ee',
                          color: '#3a8a5a',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {rev.reviewer.split(' ').map(n=>n[0]).join('').toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e1e24' }}>
                          {rev.reviewer}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#ffb400', fontSize: '12px' }}>
                          {'★'.repeat(rev.stars) + '☆'.repeat(5 - rev.stars)}
                        </span>
                        <span style={{ fontSize: '11px', color: '#888888' }}>
                          {rev.date}
                        </span>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#555555', margin: 0, paddingLeft: '40px' }}>
                      "{rev.text}"
                    </p>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#3a8a5a', cursor: 'pointer' }}>
                  See all reviews →
                </span>
              </div>
            </div>

            {/* Section G: Sticky Action Bar */}
            <div style={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#ffffff',
              borderTop: '1px solid #f0edf0',
              padding: '16px 24px',
              display: 'flex',
              gap: '12px',
              zIndex: 20
            }}>
              <button 
                type="button"
                className="modal-action-msg-btn"
                onClick={() => {
                  openChat(profileModalWriter.id, profileModalWriter.fullName || profileModalWriter.name, true);
                }}
                style={{
                  flex: 1,
                  border: '1.5px solid #4caf7d',
                  color: '#4caf7d',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                💬 Message Writer
              </button>
              
              <button 
                type="button"
                className="modal-action-req-btn"
                onClick={() => {
                  requestWriter(profileModalWriter.id);
                  closeProfileModal();
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#e07a7a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                Request This Writer →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- CHAT DRAWER PANEL ----------------- */}
      {/* Backdrop for active chat */}
      <div 
        className="drawer-backdrop"
        style={{
          opacity: isChatPanelOpen ? 1 : 0,
          pointerEvents: isChatPanelOpen ? 'auto' : 'none'
        }}
        onClick={closeChat}
      />

      <div 
        className="drawer-panel"
        style={{
          width: '100%',
          maxWidth: '380px',
          transform: isChatPanelOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #f0edf0',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={closeChat}
              style={{
                border: 'none',
                background: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#555555',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              aria-label="Back"
            >
              ←
            </button>
            
            {/* Writer Avatar & Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {(() => {
                const wObj = activeWriters.find(w => w.id === activeChatWriterId) || {};
                const statusColor = wObj.status === 'available' ? '#4caf7d' : wObj.status === 'busy' ? '#FFA500' : '#999999';
                const statusLabel = wObj.status === 'available' ? 'Available Now' : wObj.status === 'busy' ? 'Busy' : 'Offline';
                return (
                  <>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: statusColor,
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      {wObj.initials || activeChatWriterName?.charAt(0) || 'W'}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1e24', lineHeight: 1.2 }}>
                        {activeChatWriterName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: statusColor,
                          display: 'inline-block'
                        }} />
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#777777' }}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* View Profile CTA */}
          <button
            type="button"
            onClick={handleViewProfileFromChat}
            style={{
              fontSize: '13px',
              color: '#4caf7d',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
          >
            View Profile
          </button>
        </div>

        {/* Messages scroll section */}
        <div 
          ref={messageContainerRef}
          className="chat-scroll-container"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: '#fbfafb',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {isMessagesLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2.5px solid #e0e0e0', borderTopColor: '#e07a7a', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px', color: '#888888', fontWeight: 500 }}>Loading messages...</span>
            </div>
          ) : chatMessages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6, padding: '0 32px', textAlign: 'center' }}>
              <span style={{ fontSize: '40px', marginBottom: '12px' }}>💬</span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1e24' }}>No messages yet</div>
              <div style={{ fontSize: '13px', color: '#666666', marginTop: '4px' }}>Send a message to start the conversation with {activeChatWriterName}.</div>
            </div>
          ) : (
            chatMessages.map((msg, index) => {
              const currentDateLabel = getMessageDateLabel(msg.created_at);
              const prevMsg = index > 0 ? chatMessages[index - 1] : null;
              const prevDateLabel = prevMsg ? getMessageDateLabel(prevMsg.created_at) : null;
              const showDateHeader = currentDateLabel && currentDateLabel !== prevDateLabel;

              const isMe = msg.sender_role === 'student';

              return (
                <React.Fragment key={msg.id || index}>
                  {showDateHeader && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      margin: '12px 0 4px 0',
                      width: '100%'
                    }}>
                      <span style={{
                        backgroundColor: '#e6e5e6',
                        color: '#666666',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {currentDateLabel}
                      </span>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}>
                    <div style={{
                      backgroundColor: isMe ? '#e07a7a' : '#ffffff',
                      color: isMe ? '#ffffff' : '#1e1e24',
                      padding: '10px 14px',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      border: isMe ? 'none' : '1px solid #f0edf0',
                      fontSize: '14.5px',
                      lineHeight: 1.5,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      wordBreak: 'break-word'
                    }}>
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(msg.content).replace(/\n/g, '<br/>') }} />
                    </div>

                    {isMe ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#888888' }}>{formatMsgTime(msg.created_at)}</span>
                        {msg.failed ? (
                          <span 
                            style={{ fontSize: '10px', color: '#d9534f', cursor: 'pointer', fontWeight: 600 }}
                            onClick={() => retryMessage(msg)}
                          >
                            ⚠️ Retry
                          </span>
                        ) : msg.is_read ? (
                          <span style={{ color: '#4caf7d', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓✓</span>
                        ) : (
                          <span style={{ color: '#a0a0a0', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>✓</span>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', color: '#888888' }}>{formatMsgTime(msg.created_at)}</span>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })
          )}

          {/* Typing Indicator Bubble */}
          {isWriterTyping && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: 'flex-start', maxWidth: '80%', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#888', marginLeft: '12px' }}>{activeChatWriterName} is typing...</div>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #f0edf0',
                padding: '10px 14px',
                borderRadius: '16px 16px 16px 4px',
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #f0edf0',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {chatInputText.length > 800 && (
            <div style={{
              fontSize: '11px',
              color: chatInputText.length >= 1000 ? '#d9534f' : '#888888',
              fontWeight: 600,
              textAlign: 'right',
              paddingRight: '4px'
            }}>
              {chatInputText.length}/1000
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value.substring(0, 1000))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendClick();
                }
              }}
              placeholder="Type a message..."
              style={{
                flex: 1,
                border: '1.5px solid #e2e0e2',
                borderRadius: '24px',
                padding: '10px 16px',
                fontSize: '14.5px',
                outline: 'none',
                backgroundColor: '#fbfbfb',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e07a7a'}
              onBlur={(e) => e.target.style.borderColor = '#e2e0e2'}
            />
            
            <button
              type="button"
              onClick={handleSendClick}
              disabled={!chatInputText.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: chatInputText.trim() ? '#e07a7a' : '#f0edf0',
                color: '#ffffff',
                border: 'none',
                cursor: chatInputText.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s, transform 0.1s',
                outline: 'none'
              }}
              onMouseDown={(e) => chatInputText.trim() && (e.currentTarget.style.transform = 'scale(0.92)')}
              onMouseUp={(e) => chatInputText.trim() && (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{ fontSize: '16px', transform: 'rotate(45deg)', display: 'inline-block', position: 'relative', top: '-1px', left: '-1px' }}>➤</span>
            </button>
          </div>
        </div>
      </div>

      {/* ----------------- CONVERSATIONS LIST DRAWER ----------------- */}
      {/* Backdrop for conversations list */}
      <div 
        className="drawer-backdrop"
        style={{
          opacity: isConversationsOpen ? 1 : 0,
          pointerEvents: isConversationsOpen ? 'auto' : 'none'
        }}
        onClick={() => setIsConversationsOpen(false)}
      />

      <div 
        className="drawer-panel"
        style={{
          width: '100%',
          maxWidth: '380px',
          transform: isConversationsOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '18px 20px',
          borderBottom: '1px solid #f0edf0',
          backgroundColor: '#ffffff'
        }}>
          <button
            type="button"
            onClick={() => setIsConversationsOpen(false)}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#555555',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close"
          >
            ←
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e1e24', margin: 0 }}>
            Messages
          </h2>
        </div>

        {/* Conversations List */}
        <div 
          className="chat-scroll-container"
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#ffffff'
          }}
        >
          {conversations.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6, padding: '0 32px', textAlign: 'center' }}>
              <span style={{ fontSize: '40px', marginBottom: '12px' }}>📬</span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e1e24' }}>No conversations yet</div>
              <div style={{ fontSize: '13px', color: '#666666', marginTop: '4px' }}>Click on a writer on the radar map and select "Message Writer" to start chatting!</div>
            </div>
          ) : (
            // Sort conversations list dynamically by the most recent message timestamp
            [...conversations]
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((conv) => {
                const wObj = activeWriters.find(w => w.id === conv.writer_id) || {};
                const statusColor = wObj.status === 'available' ? '#4caf7d' : wObj.status === 'busy' ? '#FFA500' : '#999999';
                const unreadCount = unreadCounts[conv.conversation_id] || conv.unread_count || 0;

                return (
                  <div
                    key={conv.conversation_id}
                    onClick={() => openChat(conv.writer_id, conv.writer_name, false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px 20px',
                      borderBottom: '1px solid #f8f6f8',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      backgroundColor: unreadCount > 0 ? '#faf5f5' : '#ffffff'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fbfafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = unreadCount > 0 ? '#faf5f5' : '#ffffff'}
                  >
                    {/* Left avatar with status ring */}
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: statusColor,
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        {wObj.initials || conv.writer_name?.charAt(0) || 'W'}
                      </div>
                      <span style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: statusColor,
                        border: '2px solid #ffffff'
                      }} />
                    </div>

                    {/* Middle details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                        <span style={{ fontSize: '14.5px', fontWeight: unreadCount > 0 ? 800 : 700, color: '#1e1e24', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conv.writer_name}
                        </span>
                        <span style={{ fontSize: '11px', color: '#888888', flexShrink: 0 }}>
                          {formatRelativeTime(conv.timestamp)}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '13px',
                        color: unreadCount > 0 ? '#1e1e24' : '#666666',
                        fontWeight: unreadCount > 0 ? 600 : 400,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {conv.last_message}
                      </p>
                    </div>

                    {/* Right badge */}
                    {unreadCount > 0 && (
                      <div style={{
                        backgroundColor: '#e07a7a',
                        color: '#ffffff',
                        borderRadius: '50%',
                        minWidth: '20px',
                        height: '20px',
                        padding: '0 4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(224, 122, 122, 0.3)'
                      }}>
                        {unreadCount}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* ----------------- FLOATING MESSAGES HUB BUTTON ----------------- */}
      {(() => {
        const totalUnreadCount = Object.values(unreadCounts).reduce((sum, val) => sum + val, 0);
        return (
          <button
            type="button"
            className="floating-inbox-btn"
            onClick={() => setIsConversationsOpen(true)}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#e07a7a',
              boxShadow: '0 4px 16px rgba(224, 122, 122, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              color: '#ffffff',
              zIndex: 99980
            }}
            aria-label="Messages Hub"
          >
            {/* SVG Chat Bubble Icon */}
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>

            {/* Total Unread Notification Count Badge */}
            {totalUnreadCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#ff3b30',
                color: '#ffffff',
                borderRadius: '12px',
                minWidth: '20px',
                height: '20px',
                padding: '0 6px',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                border: '2px solid #ffffff'
              }}>
                {totalUnreadCount}
              </div>
            )}
          </button>
        );
      })()}

    </div>
  );
}

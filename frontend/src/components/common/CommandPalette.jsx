import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import {
  Search, LayoutDashboard, PlusCircle, FileText, CreditCard,
  Briefcase, TrendingUp, Users, CheckSquare, BarChart3,
  LogOut, Sun, Moon, Command, ArrowRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const commandsByRole = {
  STUDENT: [
    { id: 'student-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/student', group: 'Navigation' },
    { id: 'student-new-order', label: 'Create New Order', icon: PlusCircle, path: '/student/new-order', group: 'Navigation' },
    { id: 'student-orders', label: 'View My Orders', icon: FileText, path: '/student/orders', group: 'Navigation' },
    { id: 'student-billing', label: 'Billing & Plans', icon: CreditCard, path: '/student/billing', group: 'Navigation' },
  ],
  WRITER: [
    { id: 'writer-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/writer', group: 'Navigation' },
    { id: 'writer-assignments', label: 'View Assignments', icon: Briefcase, path: '/writer/assignments', group: 'Navigation' },
    { id: 'writer-earnings', label: 'Earnings Analytics', icon: TrendingUp, path: '/writer/earnings', group: 'Navigation' },
  ],
  ADMIN: [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin', group: 'Navigation' },
    { id: 'admin-orders', label: 'Manage Orders', icon: FileText, path: '/admin/orders', group: 'Navigation' },
    { id: 'admin-users', label: 'Manage Users', icon: Users, path: '/admin/users', group: 'Navigation' },
    { id: 'admin-approvals', label: 'Writer Approvals', icon: CheckSquare, path: '/admin/approvals', group: 'Navigation' },
    { id: 'admin-analytics', label: 'Platform Analytics', icon: BarChart3, path: '/admin/analytics', group: 'Navigation' },
  ],
};

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const systemCommands = [
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: theme === 'dark' ? Sun : Moon,
      group: 'System',
      action: () => { toggleTheme(); toast.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`); },
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: LogOut,
      group: 'System',
      action: () => { logout(); navigate('/login'); toast.success('Signed out'); },
    },
  ];

  const roleCommands = commandsByRole[user?.role?.toUpperCase()] || [];
  const allCommands = [...roleCommands, ...systemCommands];

  const filtered = query.trim()
    ? allCommands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.group.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  const open = useCallback(() => { setIsOpen(true); setQuery(''); setSelectedIdx(0); }, []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        if (!isOpen) { setQuery(''); setSelectedIdx(0); }
      }
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      execute(filtered[selectedIdx]);
    }
  };

  const execute = (cmd) => {
    close();
    if (cmd.action) {
      cmd.action();
    } else if (cmd.path) {
      navigate(cmd.path);
    }
  };

  // Group commands
  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  let flatIdx = 0;
  const groupedWithIndex = Object.entries(grouped).map(([group, cmds]) => ({
    group,
    cmds: cmds.map(cmd => ({ ...cmd, flatIndex: flatIdx++ })),
  }));

  return (
    <>
      {/* Keyboard shortcut hint in TopNav — trigger for opening */}
      <button
        id="cmd-palette-trigger"
        onClick={open}
        className="hidden"
        aria-label="Open command palette"
      />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
              onClick={close}
            />

            {/* Palette Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[201] w-full max-w-lg"
            >
              <div className="bg-[#111113] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                  <Search className="w-4 h-4 text-muted shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search commands, pages..."
                    className="flex-1 bg-transparent text-sm text-primary placeholder:text-muted outline-none font-inter"
                  />
                  <kbd className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-muted">
                    <Command className="w-2.5 h-2.5" />K
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto py-2">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <p className="text-muted text-xs font-mono uppercase tracking-wider">No commands match</p>
                    </div>
                  ) : (
                    groupedWithIndex.map(({ group, cmds }) => (
                      <div key={group} className="mb-1">
                        <div className="px-4 py-1.5">
                          <span className="text-[9px] font-mono font-semibold text-muted uppercase tracking-widest">{group}</span>
                        </div>
                        {cmds.map((cmd) => {
                          const IconComponent = cmd.icon;
                          const isSelected = cmd.flatIndex === selectedIdx;
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => execute(cmd)}
                              onMouseEnter={() => setSelectedIdx(cmd.flatIndex)}
                              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                                isSelected ? 'bg-[#c5a880]/10' : 'hover:bg-white/[0.03]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected ? 'bg-[#c5a880]/15 text-[#c5a880]' : 'bg-white/5 text-muted'
                                }`}>
                                  <IconComponent className="w-3.5 h-3.5" />
                                </div>
                                <span className={`text-xs font-medium transition-colors ${
                                  isSelected ? 'text-primary' : 'text-secondary'
                                }`}>{cmd.label}</span>
                              </div>
                              {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#c5a880]" />}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer hint */}
                <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-4">
                  <span className="text-[9px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <kbd className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[8px]">↑↓</kbd> Navigate
                  </span>
                  <span className="text-[9px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <kbd className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[8px]">↵</kbd> Select
                  </span>
                  <span className="text-[9px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <kbd className="bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[8px]">Esc</kbd> Close
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

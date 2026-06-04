import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { useSidebar } from '../../context/SidebarContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Menu, Sun, Moon, Command } from 'lucide-react';

export default function TopNav({ title }) {
  const { unreadCount, markAllRead } = useNotificationStore();
  const { user } = useAuthStore();
  const { toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const openCommandPalette = () => {
    // Programmatic trigger for command palette
    const trigger = document.getElementById('cmd-palette-trigger');
    if (trigger) trigger.click();
  };

  return (
    <header className="flex items-center justify-between mb-8 gap-4 select-none">
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="lg:hidden p-2 bg-[#111113] border border-white/5 rounded-md text-secondary hover:text-[#c5a880] transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-orbitron font-semibold text-lg text-primary truncate max-w-[150px] sm:max-w-none uppercase tracking-wider">{title}</h2>
          <p className="hidden sm:block text-muted text-[10px] font-mono mt-1 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <button
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#111113] border border-white/5 rounded-md text-muted hover:text-secondary hover:border-white/10 transition-colors text-[10px] font-mono"
          aria-label="Open command palette"
          title="Open command palette (Ctrl+K)"
        >
          <Command className="w-3 h-3" />
          <span className="uppercase tracking-wider">Ctrl K</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-[#111113] border border-white/5 rounded-md hover:border-[#c5a880]/30 transition-colors"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-secondary hover:text-[#c5a880] transition-colors" />
            : <Moon className="w-4 h-4 text-secondary hover:text-[#c5a880] transition-colors" />
          }
        </button>

        {/* Notifications */}
        <button
          onClick={markAllRead}
          className="relative p-2.5 bg-[#111113] border border-white/5 rounded-md hover:border-[#c5a880]/30 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#cb6e6e] text-white text-[9px] flex items-center justify-center font-mono font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 bg-[#111113] border border-white/5 px-3 py-1.5 rounded-md">
          <div className="w-6.5 h-6.5 rounded-full bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] text-xs font-orbitron font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="hidden md:block text-xs text-secondary font-medium tracking-wide uppercase font-orbitron">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
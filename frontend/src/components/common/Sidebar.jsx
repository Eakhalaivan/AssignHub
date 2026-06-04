import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSidebar } from '../../context/SidebarContext';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  CreditCard, 
  Briefcase, 
  TrendingUp, 
  Users, 
  CheckSquare, 
  BarChart3, 
  LogOut,
  X,
  UserCheck
} from 'lucide-react';

const navMap = {
  STUDENT: [
    { path: '/student',            label: 'Dashboard',         icon: LayoutDashboard },
    { path: '/student/new-order',  label: 'New Order',         icon: PlusCircle },
    { path: '/student/orders',     label: 'My Orders',         icon: FileText },
    { path: '/student/billing',    label: 'Billing & Plans',   icon: CreditCard },
  ],
  WRITER: [
    { path: '/writer',             label: 'Dashboard',         icon: LayoutDashboard },
    { path: '/writer/assignments', label: 'Assignments',       icon: Briefcase },
    { path: '/writer/earnings',    label: 'Earnings',          icon: TrendingUp },
    { path: '/writer/onboarding',  label: 'Setup Profile',     icon: UserCheck },
  ],
  ADMIN: [
    { path: '/admin',              label: 'Dashboard',         icon: LayoutDashboard },
    { path: '/admin/orders',       label: 'Manage Orders',     icon: FileText },
    { path: '/admin/users',        label: 'Manage Users',      icon: Users },
    { path: '/admin/approvals',    label: 'Writer Approvals',  icon: CheckSquare },
    { path: '/admin/analytics',    label: 'Analytics',         icon: BarChart3 },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { isOpen, close } = useSidebar();
  const navigate = useNavigate();
  const links = navMap[user?.role?.toUpperCase()] || [];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
    close();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 pointer-events-auto",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={close}
      />

      {/* Sidebar Content */}
      <aside className={clsx(
        "fixed top-0 left-0 h-screen w-60 bg-[#111113] border-r border-white/5 z-50 flex flex-col py-8 px-5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 select-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo and branding */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-orbitron font-extrabold text-xl text-[#fafafa] tracking-wider leading-none">
              ACADEMIX
            </h1>
            <p className="text-muted text-[9px] mt-1.5 font-mono uppercase tracking-widest">
              Premium Portal
            </p>
          </div>
          <button onClick={close} className="lg:hidden text-muted hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role tag */}
        <div className="mb-6 px-4 py-2.5 rounded bg-white/[0.02] border border-white/5">
          <span className="text-muted text-[8px] font-mono uppercase block font-medium tracking-wider">System Role</span>
          <span className="text-[#c5a880] text-xs font-orbitron font-semibold mt-0.5 uppercase tracking-widest block">
            {user?.role}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path.split('/').length === 2}
                onClick={close}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-2.5 rounded text-[11px] font-orbitron font-medium uppercase tracking-wider transition-all duration-200 border border-transparent',
                    isActive
                      ? 'bg-[#c5a880]/10 text-[#c5a880] border-[#c5a880]/20 font-bold'
                      : 'text-secondary hover:text-[#c5a880] hover:bg-white/[0.02]'
                  )
                }
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile & logout */}
        <div className="border-t border-white/5 pt-5 space-y-3.5">
          <div className="px-2 select-text">
            <p className="text-primary text-xs font-semibold font-orbitron truncate uppercase tracking-wider">{user?.name}</p>
            <p className="text-muted text-[10px] font-mono truncate mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded text-alert font-orbitron text-[10px] font-bold border border-alert/20 hover:bg-alert/5 transition-all duration-200 text-left uppercase tracking-wider flex items-center gap-2 justify-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { pageTransition } from '../../animations/presets';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success('Access granted! Mission Control Authorized.');
      const role = data.data.user.role;
      navigate(role === 'STUDENT' ? '/student' : role === 'WRITER' ? '/writer' : '/admin');
    } catch {
      toast.error('Access Denied. Invalid credentials signature.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-void flex items-center justify-center relative overflow-hidden bg-grid-ambient"
    >
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-plasma/5 blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-orbit/5 blur-3xl animate-float pointer-events-none" />

      <div className="w-full max-w-md mx-4 select-none">
        <div className="glass-elevated rounded-3xl p-10 shadow-glow-plasma border-plasma/25">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-orbitron font-black text-3.5xl text-plasma text-glow-plasma tracking-widest mb-1.5">
              ACADEMIX
            </h1>
            <p className="text-muted text-[10.5px] font-mono tracking-widest uppercase">
              MISSION CONTROL AUTHENTICATION
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Operator Email"
              type="email"
              placeholder="you@college.edu"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
            <Input
              label="Access Code (Password)"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
            <Button 
              type="submit" 
              variant="plasma" 
              size="lg" 
              className="w-full mt-3.5 font-bold font-orbitron tracking-widest py-3 text-xs" 
              loading={loading}
            >
              AUTHENTICATE NODE →
            </Button>
          </form>

          <p className="text-center text-muted text-xs font-mono mt-8 uppercase">
            No active node?{' '}
            <Link to="/register" className="text-plasma hover:text-glow-plasma transition-all font-bold">
              Register Node →
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
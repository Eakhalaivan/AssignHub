import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/authApi';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { pageTransition } from '../../animations/presets';

const roles = ['STUDENT', 'WRITER'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch {
      toast.error('Registration failed. Credentials signature may conflict.');
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
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-orbit/5 blur-3xl animate-float pointer-events-none" />

      <div className="w-full max-w-md mx-4 select-none">
        <div className="glass-elevated rounded-3xl p-10 shadow-glow-plasma border-plasma/25">
          <div className="text-center mb-9">
            <h1 className="font-orbitron font-black text-3.5xl text-plasma text-glow-plasma tracking-widest mb-1.5">
              ACADEMIX
            </h1>
            <p className="text-muted text-[10.5px] font-mono tracking-widest uppercase">
              PROVISION NEW NODE ACCESS
            </p>
          </div>

          {/* Role selector */}
          <div className="flex gap-2.5 mb-7 bg-void/35 p-1 rounded-xl border border-white/5 select-none">
            {roles.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: r }))}
                className={`flex-1 py-3 rounded-lg text-[10px] font-orbitron font-bold uppercase tracking-wider transition-all duration-300 ${
                  form.role === r
                    ? 'bg-plasma/15 border border-plasma/40 text-plasma shadow-[0_0_8px_rgba(0,212,255,0.15)]'
                    : 'border border-transparent text-muted hover:text-secondary hover:bg-white/5'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Operator Name"
              placeholder="Your full name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
            />
            <Input
              label="Operator Email"
              type="email"
              placeholder="you@college.edu"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
            <Input
              label="Communications Phone"
              type="tel"
              placeholder="+91 9876543210"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              required
            />
            <Input
              label="Secret Key (Password)"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
            
            <Button 
              type="submit" 
              variant="orbit" 
              size="lg" 
              className="w-full mt-3.5 font-bold font-orbitron tracking-widest py-3 text-xs" 
              loading={loading}
            >
              LAUNCH NODE ACCOUNT →
            </Button>
          </form>

          <p className="text-center text-muted text-xs font-mono mt-8 uppercase">
            Active node exists?{' '}
            <Link to="/login" className="text-plasma hover:text-glow-plasma transition-all font-bold">
              Login →
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
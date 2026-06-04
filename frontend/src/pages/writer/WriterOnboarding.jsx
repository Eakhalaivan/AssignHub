import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../../animations/presets';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import TopNav from '../../components/common/TopNav';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import {
  User, Briefcase, BookOpen, Clock, CheckCircle,
  ChevronRight, ChevronLeft, GraduationCap
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Personal Info', icon: User, desc: 'Tell us about yourself' },
  { id: 2, label: 'Academic Background', icon: GraduationCap, desc: 'Credentials & qualifications' },
  { id: 3, label: 'Expertise & Skills', icon: BookOpen, desc: 'Areas you specialize in' },
  { id: 4, label: 'Availability', icon: Clock, desc: 'Weekly schedule & capacity' },
  { id: 5, label: 'Review & Submit', icon: CheckCircle, desc: 'Confirm your profile' },
];

const EXPERTISE_OPTIONS = [
  'Mathematics', 'Computer Science', 'Physics', 'Chemistry',
  'Biology', 'Literature', 'History', 'Economics',
  'Psychology', 'Law', 'Engineering', 'Business & Management',
  'Philosophy', 'Political Science', 'Sociology', 'Medicine'
];

const DEGREE_OPTIONS = ['Bachelor\'s', 'Master\'s', 'PhD', 'Professional Degree', 'Other'];
const URGENCY_OPTIONS = ['3 Hours', '6 Hours', '12 Hours', '24 Hours', '48 Hours'];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)'];

export default function WriterOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    name: '',
    phone: '',
    city: '',
    country: 'India',
    // Step 2
    degree: '',
    institution: '',
    bio: '',
    // Step 3
    expertise: [],
    languages: '',
    minDeadlineHours: '3',
    // Step 4
    availability: {}, // { 'Mon-Morning': true, ... }
  });

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleExpertise = (item) => {
    setForm(prev => ({
      ...prev,
      expertise: prev.expertise.includes(item)
        ? prev.expertise.filter(e => e !== item)
        : [...prev.expertise, item]
    }));
  };

  const toggleSlot = (day, slot) => {
    const key = `${day}-${slot}`;
    setForm(prev => ({
      ...prev,
      availability: { ...prev.availability, [key]: !prev.availability[key] }
    }));
  };

  const availableSlots = Object.values(form.availability).filter(Boolean).length;

  const validateStep = () => {
    if (currentStep === 1 && (!form.name || !form.city)) {
      toast.error('Please fill in your name and city.');
      return false;
    }
    if (currentStep === 2 && (!form.degree || !form.bio || form.bio.length < 30)) {
      toast.error('Please select your degree and write a brief bio (min 30 chars).');
      return false;
    }
    if (currentStep === 3 && form.expertise.length === 0) {
      toast.error('Please select at least one area of expertise.');
      return false;
    }
    if (currentStep === 4 && availableSlots === 0) {
      toast.error('Please select at least one availability slot.');
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setCurrentStep(s => Math.min(s + 1, STEPS.length));
  };

  const back = () => setCurrentStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        bio: form.bio,
        degree: form.degree,
        expertise: form.expertise.join(', '),
        minDeadlineHours: parseInt(form.minDeadlineHours),
        city: form.city,
        country: form.country,
        languages: form.languages || 'English',
        availabilitySlots: Object.keys(form.availability).filter(k => form.availability[k]),
      };

      const res = await api.put('/writer/profile', payload);

      if (res.status === 200 || res.status === 204) {
        toast.success('Writer profile submitted for review!');
        navigate('/writer');
      } else {
        toast.error(res.data?.message || 'Profile update failed. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile update failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepSlideVariants = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-3xl mx-auto"
    >
      <TopNav title="Writer Onboarding" />

      {/* Progress Header */}
      <Card className="p-6 bg-[#111113] border-white/5" animate={false}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-orbitron font-semibold text-base text-primary uppercase tracking-wider">
              Complete Your Writer Profile
            </h2>
            <p className="text-muted text-xs font-mono mt-1">
              Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].desc}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[#c5a880] font-mono font-bold text-lg">
              {Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100)}%
            </span>
            <p className="text-muted text-[9px] font-mono uppercase tracking-wider">Complete</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1">
          {STEPS.map((step, i) => {
            const isDone = currentStep > step.id;
            const isActive = currentStep === step.id;
            const StepIcon = step.icon;
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 shrink-0 transition-all duration-300 ${
                  isActive ? 'opacity-100' : isDone ? 'opacity-80' : 'opacity-30'
                }`}>
                  <div className={`w-7 h-7 rounded flex items-center justify-center border transition-all ${
                    isDone
                      ? 'bg-[#70a382]/20 border-[#70a382]/40 text-[#70a382]'
                      : isActive
                      ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880]'
                      : 'bg-white/5 border-white/10 text-muted'
                  }`}>
                    <StepIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`hidden sm:block text-[10px] font-mono uppercase tracking-wider font-medium ${
                    isActive ? 'text-[#c5a880]' : isDone ? 'text-[#70a382]' : 'text-muted'
                  }`}>{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 transition-colors duration-300 ${isDone ? 'bg-[#70a382]/40' : 'bg-white/5'}`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={stepSlideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {currentStep === 1 && (
            <Card className="p-6 bg-[#111113] border-white/5 space-y-5" animate={false}>
              <h3 className="font-orbitron font-semibold text-secondary text-xs uppercase tracking-widest border-b border-white/5 pb-3">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">Full Name *</label>
                  <input
                    className="input-antigravity"
                    placeholder="e.g. Dr. Ananya Sharma"
                    value={form.name}
                    onChange={e => updateForm('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">Phone Number</label>
                  <input
                    className="input-antigravity"
                    placeholder="+91 98XXXXXXXX"
                    value={form.phone}
                    onChange={e => updateForm('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">City *</label>
                  <input
                    className="input-antigravity"
                    placeholder="e.g. Mumbai"
                    value={form.city}
                    onChange={e => updateForm('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">Country</label>
                  <select
                    className="input-antigravity"
                    value={form.country}
                    onChange={e => updateForm('country', e.target.value)}
                  >
                    {['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Other'].map(c => (
                      <option key={c} value={c} style={{ background: '#111113' }}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="p-6 bg-[#111113] border-white/5 space-y-5" animate={false}>
              <h3 className="font-orbitron font-semibold text-secondary text-xs uppercase tracking-widest border-b border-white/5 pb-3">
                Academic Credentials
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">Highest Degree *</label>
                    <select
                      className="input-antigravity"
                      value={form.degree}
                      onChange={e => updateForm('degree', e.target.value)}
                    >
                      <option value="" style={{ background: '#111113' }}>Select degree...</option>
                      {DEGREE_OPTIONS.map(d => (
                        <option key={d} value={d} style={{ background: '#111113' }}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">Institution / University</label>
                    <input
                      className="input-antigravity"
                      placeholder="e.g. IIT Bombay"
                      value={form.institution}
                      onChange={e => updateForm('institution', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">
                    Professional Bio & Credentials Statement *
                    <span className="ml-2 text-[#c5a880]">({form.bio.length}/500)</span>
                  </label>
                  <textarea
                    className="input-antigravity resize-none"
                    rows={5}
                    maxLength={500}
                    placeholder="Describe your academic background, teaching experience, areas of expertise, and why you'd be a great writer on Academix..."
                    value={form.bio}
                    onChange={e => updateForm('bio', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="p-6 bg-[#111113] border-white/5 space-y-5" animate={false}>
              <h3 className="font-orbitron font-semibold text-secondary text-xs uppercase tracking-widest border-b border-white/5 pb-3">
                Expertise & Skills
              </h3>
              <div>
                <label className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-3">
                  Subject Areas * — Select all that apply ({form.expertise.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE_OPTIONS.map(item => {
                    const isSelected = form.expertise.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleExpertise(item)}
                        className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider border transition-all duration-150 ${
                          isSelected
                            ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880] font-semibold'
                            : 'bg-transparent border-white/10 text-muted hover:border-white/25 hover:text-secondary'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">Languages</label>
                  <input
                    className="input-antigravity"
                    placeholder="e.g. English, Hindi"
                    value={form.languages}
                    onChange={e => updateForm('languages', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">Minimum Turnaround Time</label>
                  <select
                    className="input-antigravity"
                    value={form.minDeadlineHours}
                    onChange={e => updateForm('minDeadlineHours', e.target.value)}
                  >
                    {URGENCY_OPTIONS.map(u => (
                      <option key={u} value={u.split(' ')[0]} style={{ background: '#111113' }}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="p-6 bg-[#111113] border-white/5 space-y-5" animate={false}>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-orbitron font-semibold text-secondary text-xs uppercase tracking-widest">
                  Weekly Availability Schedule
                </h3>
                <span className="text-[#c5a880] font-mono text-xs font-bold">{availableSlots} slots selected</span>
              </div>

              <p className="text-muted text-xs font-dm">
                Select the time slots when you are available to work on assignments each week. This helps us match you with orders that fit your schedule.
              </p>

              {/* 7×3 Availability Grid */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead>
                    <tr>
                      <th className="text-[9px] font-mono text-muted uppercase tracking-wider pb-3 text-left w-32">Time Slot</th>
                      {DAYS.map(day => (
                        <th key={day} className="text-[9px] font-mono text-muted uppercase tracking-wider pb-3 text-center">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {SLOTS.map(slot => (
                      <tr key={slot} className="border-t border-white/[0.03]">
                        <td className="py-3 pr-4">
                          <span className="text-[10px] font-mono text-secondary uppercase tracking-wider whitespace-nowrap">{slot}</span>
                        </td>
                        {DAYS.map(day => {
                          const key = `${day}-${slot}`;
                          const isOn = form.availability[key];
                          return (
                            <td key={day} className="py-3 text-center">
                              <button
                                onClick={() => toggleSlot(day, slot)}
                                className={`w-8 h-8 rounded transition-all duration-150 border ${
                                  isOn
                                    ? 'bg-[#c5a880]/20 border-[#c5a880]/50 shadow-sm'
                                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07]'
                                }`}
                                aria-label={`${day} ${slot} ${isOn ? 'selected' : 'not selected'}`}
                              >
                                {isOn && (
                                  <span className="block w-2 h-2 rounded-full bg-[#c5a880] mx-auto" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[9px] font-mono text-muted uppercase tracking-wider">
                Highlighted cells = available · You can update this later from your profile settings
              </p>
            </Card>
          )}

          {currentStep === 5 && (
            <Card className="p-6 bg-[#111113] border-white/5 space-y-5" animate={false}>
              <h3 className="font-orbitron font-semibold text-secondary text-xs uppercase tracking-widest border-b border-white/5 pb-3">
                Review Your Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Name', value: form.name || '—' },
                  { label: 'City', value: form.city || '—' },
                  { label: 'Degree', value: form.degree || '—' },
                  { label: 'Institution', value: form.institution || '—' },
                  { label: 'Min Turnaround', value: `${form.minDeadlineHours} Hours` },
                  { label: 'Availability Slots', value: `${availableSlots} blocks selected` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-void border border-white/5 rounded p-3">
                    <span className="text-[8px] font-mono text-muted uppercase tracking-wider block mb-1">{label}</span>
                    <span className="text-xs font-orbitron font-semibold text-secondary uppercase tracking-wide">{value}</span>
                  </div>
                ))}
              </div>

              {form.expertise.length > 0 && (
                <div>
                  <span className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">Expertise Areas</span>
                  <div className="flex flex-wrap gap-2">
                    {form.expertise.map(e => (
                      <span key={e} className="px-2.5 py-1 bg-[#c5a880]/10 border border-[#c5a880]/25 text-[#c5a880] text-[10px] font-mono rounded uppercase tracking-wider">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {form.bio && (
                <div>
                  <span className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-2">Bio Statement</span>
                  <p className="text-secondary text-xs leading-relaxed italic font-dm bg-void border border-white/5 p-3 rounded">
                    "{form.bio}"
                  </p>
                </div>
              )}

              <div className="bg-[#70a382]/5 border border-[#70a382]/20 rounded p-4 flex gap-3">
                <CheckCircle className="w-4 h-4 text-[#70a382] shrink-0 mt-0.5" />
                <p className="text-secondary text-xs leading-relaxed font-dm">
                  By submitting, your profile will be reviewed by our admin team. Once approved, you will receive assignment invitations and appear in our writer directory.
                </p>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={back}
          disabled={currentStep === 1}
          className="flex items-center gap-2 text-[10px] font-bold"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </Button>

        {currentStep < STEPS.length ? (
          <Button
            variant="primary"
            size="sm"
            onClick={next}
            className="flex items-center gap-2 text-[10px] font-bold"
          >
            Continue
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={isSubmitting}
            className="flex items-center gap-2 text-[10px] font-bold"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Submit Profile
          </Button>
        )}
      </div>
    </motion.div>
  );
}

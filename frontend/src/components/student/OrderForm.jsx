import React, { useState } from 'react';
import GlowButton from '../common/GlowButton';
import PricingMeter from './PricingMeter';

export const OrderForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    wordCount: 500,
    academicLevel: 'undergraduate',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlider = (e) => {
    setFormData((prev) => ({ ...prev, wordCount: Number(e.target.value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold tracking-widest text-zinc-500 uppercase mb-2 px-1">Mission Title</label>
          <input
            required
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Advanced Quantum Computations Paper"
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-5 py-3.5 text-zinc-200 placeholder-zinc-600 focus:border-sky-500/50 outline-none transition-all duration-300 focus:shadow-[0_0_10px_rgba(14,165,233,0.1)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold tracking-widest text-zinc-500 uppercase mb-2 px-1">Deadline Matrix</label>
            <input
              required
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-5 py-3.5 text-zinc-200 placeholder-zinc-600 focus:border-sky-500/50 outline-none transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-zinc-500 uppercase mb-2 px-1">Target Academic Echelon</label>
            <select
              name="academicLevel"
              value={formData.academicLevel}
              onChange={handleChange}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-5 py-3.5 text-zinc-200 focus:border-sky-500/50 outline-none transition-all duration-300 cursor-pointer"
            >
              <option value="highschool" className="bg-zinc-950">High School</option>
              <option value="undergraduate" className="bg-zinc-950">Undergraduate</option>
              <option value="master" className="bg-zinc-950">Master's Tier</option>
              <option value="phd" className="bg-zinc-950">PhD / Doctorate</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold tracking-widest text-zinc-500 uppercase px-1">Token Complexity (Word Count)</label>
            <span className="text-sm font-mono font-bold text-sky-400">{formData.wordCount} words</span>
          </div>
          <input
            type="range"
            min="250"
            max="10000"
            step="250"
            value={formData.wordCount}
            onChange={handleSlider}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-zinc-500 uppercase mb-2 px-1">Payload Description (Instructions)</label>
          <textarea
            required
            rows={5}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe scope, parameters, and strict conditions..."
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-5 py-3.5 text-zinc-200 placeholder-zinc-600 focus:border-sky-500/50 outline-none transition-all duration-300 resize-none focus:shadow-[0_0_10px_rgba(14,165,233,0.1)]"
          />
        </div>
      </div>

      <div className="border-t border-zinc-800/50 pt-6">
        <PricingMeter wordCount={formData.wordCount} level={formData.academicLevel} />
      </div>

      <GlowButton
        type="submit"
        disabled={isLoading}
        className="w-full bg-sky-500 text-white font-bold hover:shadow-glow-accent uppercase tracking-widest text-sm py-4"
      >
        {isLoading ? 'Transmitting payload...' : 'Broadcast Mission Directive'}
      </GlowButton>
    </form>
  );
};

export default OrderForm;

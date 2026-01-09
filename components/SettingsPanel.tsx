import React from 'react';
import { GlobalConfig } from '../types';
import { Sliders, Search, Clock, Zap, Sparkles, Layers } from 'lucide-react';

interface SettingsPanelProps {
  config: GlobalConfig;
  onChange: (newConfig: GlobalConfig) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onChange }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-heading font-semibold text-slate-800">Global Resources & Assumptions</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Hiring Duration:</span>
                <input 
                    type="number"
                    min="1"
                    max="52"
                    value={config.hiringDuration}
                    onChange={(e) => onChange({...config, hiringDuration: Math.min(52, Math.max(1, parseInt(e.target.value) || 12))})}
                    className="w-10 bg-transparent text-sm font-bold text-brand-primary focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase">Wks</span>
            </div>
            <div className="flex items-center gap-2 bg-brand-light/20 px-3 py-2 rounded-lg border border-brand-light">
                <Zap className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-bold text-brand-primary uppercase tracking-tight">Ramp Up:</span>
                <input 
                    type="number"
                    min="0"
                    max="12"
                    value={config.rampUpWeeks}
                    onChange={(e) => onChange({...config, rampUpWeeks: Math.min(12, Math.max(0, parseInt(e.target.value) || 0))})}
                    className="w-8 bg-transparent text-sm font-bold text-brand-primary focus:outline-none"
                />
                <span className="text-[10px] text-brand-primary font-bold uppercase">Wks</span>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sourcer Headcount Card */}
        <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Search size={14} className="text-brand-accent" /> Total Sourcers
            </label>
            {!config.isManualSourcers && (
              <span className="flex items-center gap-0.5 text-[9px] font-black text-brand-accent bg-white/80 px-1.5 py-0.5 rounded-full uppercase border border-yellow-200">
                <Sparkles size={8} /> Auto
              </span>
            )}
          </div>
          <div className="relative">
            {config.isManualSourcers && (
              <button 
                onClick={() => onChange({...config, isManualSourcers: false})}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-brand-accent hover:underline uppercase z-10"
              >
                Reset
              </button>
            )}
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={config.totalSourcers}
              onChange={(e) => onChange({...config, totalSourcers: Math.max(0, parseInt(e.target.value) || 0), isManualSourcers: true})}
              className={`w-full py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-brand-accent outline-none font-bold transition-colors ${
                config.isManualSourcers ? 'bg-white border-slate-300 text-slate-700 pl-11 pr-2' : 'bg-white/50 border-slate-200 text-brand-accent/80 px-2'
              }`}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 italic font-medium leading-tight">Shared resource pool. Auto-calculated based on Sourcer Load ratio.</p>
        </div>

        {/* TP Capacity Slider */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <Zap size={14} className="text-brand-primary" /> TP Closure Rate
          </label>
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="0.1" 
              max="5" 
              step="0.1"
              value={config.tpCapacityPerWeek}
              onChange={(e) => onChange({...config, tpCapacityPerWeek: parseFloat(e.target.value)})}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <span className="min-w-[40px] text-right font-mono text-sm font-bold text-brand-primary">{config.tpCapacityPerWeek}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Hires per TP per Week</p>
        </div>

        {/* New Sourcer Load Slider */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <Layers size={14} className="text-brand-accent" /> Sourcer Load
          </label>
           <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="1" 
              max="15" 
              step="1"
              value={config.poolsPerSourcer}
              onChange={(e) => onChange({...config, poolsPerSourcer: parseInt(e.target.value)})}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
            <span className="min-w-[40px] text-right font-mono text-sm font-bold text-brand-accent">{config.poolsPerSourcer}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Concurrent Pools per Sourcer</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
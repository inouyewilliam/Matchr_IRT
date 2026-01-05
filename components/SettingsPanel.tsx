import React from 'react';
import { GlobalConfig } from '../types';
import { Sliders, Search, Clock, Zap } from 'lucide-react';

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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
            <Search size={14} className="text-brand-accent" /> Total Sourcers
          </label>
           <div className="flex items-center gap-2">
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={config.totalSourcers}
              onChange={(e) => onChange({...config, totalSourcers: Math.max(0, parseInt(e.target.value) || 0)})}
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-brand-accent outline-none font-bold"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Shared recruitment resource pool</p>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-3">TP Capacity</label>
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
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Hires / Week</p>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Sourcer Efficiency</label>
           <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="1" 
              max="50" 
              step="1"
              value={config.sourcerCapacityPerWeek}
              onChange={(e) => onChange({...config, sourcerCapacityPerWeek: parseInt(e.target.value)})}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
            <span className="min-w-[40px] text-right font-mono text-sm font-bold text-brand-accent">{config.sourcerCapacityPerWeek}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Candidates / Week</p>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Benchmark</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="1" 
              max="50" 
              step="1"
              value={config.candidatesPerHireBenchmark}
              onChange={(e) => onChange({...config, candidatesPerHireBenchmark: parseInt(e.target.value)})}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-400"
            />
             <span className="min-w-[40px] text-right font-mono text-sm font-bold text-slate-600">{config.candidatesPerHireBenchmark}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Candidates / Hire</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
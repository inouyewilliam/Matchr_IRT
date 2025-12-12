import React from 'react';
import { GlobalConfig } from '../types';
import { Sliders, Users, Target, Search } from 'lucide-react';

interface SettingsPanelProps {
  config: GlobalConfig;
  onChange: (newConfig: GlobalConfig) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onChange }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-heading font-semibold text-slate-800">Global Resources & Assumptions</h2>
        </div>
        
        {/* Weeks to Simulate Input */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            <span className="text-xs font-medium text-slate-500">Weeks:</span>
            <input 
                type="number"
                min="1"
                max="52"
                value={config.weeksToSimulate}
                onChange={(e) => onChange({...config, weeksToSimulate: Math.min(52, Math.max(1, parseInt(e.target.value) || 12))})}
                className="w-12 bg-transparent text-sm font-bold text-slate-700 focus:outline-none"
            />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
          <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Search size={16} className="text-brand-accent" /> Total Sourcers
          </label>
           <div className="flex items-center gap-2">
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={config.totalSourcers}
              onChange={(e) => onChange({...config, totalSourcers: Math.max(0, parseInt(e.target.value) || 0)})}
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 text-sm focus:ring-1 focus:ring-brand-accent outline-none font-bold"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Shared sourcing pool</p>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-500 uppercase mb-2 flex items-center gap-2">
            TP Capacity
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="0.1" 
              max="5" 
              step="0.1"
              value={config.tpCapacityPerWeek}
              onChange={(e) => onChange({...config, tpCapacityPerWeek: parseFloat(e.target.value)})}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-dark"
            />
            <span className="w-12 text-right font-mono text-sm font-bold text-brand-dark">{config.tpCapacityPerWeek}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Hires / Week</p>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-500 uppercase mb-2 flex items-center gap-2">
            Sourcer Efficiency
          </label>
           <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="1" 
              max="50" 
              step="1"
              value={config.sourcerCapacityPerWeek}
              onChange={(e) => onChange({...config, sourcerCapacityPerWeek: parseInt(e.target.value)})}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
            <span className="w-12 text-right font-mono text-sm font-bold text-brand-accent">{config.sourcerCapacityPerWeek}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Qual. Cand. / Week</p>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-500 uppercase mb-2 flex items-center gap-2">
             Benchmark
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="1" 
              max="50" 
              step="1"
              value={config.candidatesPerHireBenchmark}
              onChange={(e) => onChange({...config, candidatesPerHireBenchmark: parseInt(e.target.value)})}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
            />
             <span className="w-12 text-right font-mono text-sm font-bold text-slate-600">{config.candidatesPerHireBenchmark}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Cand. / Hire</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
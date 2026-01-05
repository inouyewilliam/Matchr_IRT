import React, { useState } from 'react';
import { Scenario, GlobalConfig } from '../types';
import { Trash2, Settings2 } from 'lucide-react';
import { generateCurve } from '../utils/calculations';

interface ScenarioInputProps {
  scenario: Scenario;
  onUpdate: (updated: Scenario) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
  onSelect: () => void;
  config: GlobalConfig;
}

const ScenarioInput: React.FC<ScenarioInputProps> = ({
  scenario,
  onUpdate,
  onDelete,
  isActive,
  onSelect,
  config
}) => {
  const [totalTarget, setTotalTarget] = useState(scenario.demand.reduce((a, b) => a + b, 0));
  const [isEditing, setIsEditing] = useState(false);

  const handleCurveApply = () => {
    // Generate the curve based on the Hiring Duration defined in config
    const hiringDemand = generateCurve('flat', config.hiringDuration, totalTarget);
    onUpdate({ ...scenario, demand: hiringDemand });
    setIsEditing(false);
  };

  const currentTotal = scenario.demand.reduce((a, b) => a + b, 0);

  return (
    <div 
      className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isActive 
          ? 'bg-brand-light/20 border-brand-primary shadow-md ring-1 ring-brand-primary' 
          : 'bg-white border-slate-200 hover:border-brand-light hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full shadow-sm" 
            style={{ backgroundColor: scenario.color }}
          ></div>
          <input
            type="text"
            value={scenario.name}
            onChange={(e) => onUpdate({ ...scenario, name: e.target.value })}
            className="font-bold font-heading text-slate-800 bg-transparent border-b border-transparent focus:border-brand-primary focus:outline-none w-32"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(scenario.id); }}
          className="text-slate-300 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-1 gap-3">
           <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Current TPs</label>
              <input
                type="number"
                min="0"
                value={scenario.currentTalentPartners}
                onChange={(e) => onUpdate({...scenario, currentTalentPartners: parseInt(e.target.value) || 0})}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-2 focus:ring-brand-primary outline-none font-bold"
              />
           </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
           {!isEditing ? (
             <div className="flex items-center justify-between">
                <div>
                   <span className="text-xl font-bold text-slate-800 font-heading">{currentTotal.toFixed(0)}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Total Hires</span>
                </div>
                <button 
                   onClick={() => setIsEditing(true)}
                   className="p-1.5 text-brand-primary hover:bg-brand-light rounded-md transition-colors"
                >
                   <Settings2 size={16} />
                </button>
             </div>
           ) : (
             <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Hires over {config.hiringDuration} weeks
                  </label>
                  <input
                    type="number"
                    value={totalTarget}
                    onChange={(e) => setTotalTarget(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">Will begin after week {config.rampUpWeeks}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-1 text-[10px] font-bold uppercase text-slate-400 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCurveApply}
                    className="flex-1 py-1 text-[10px] font-bold uppercase bg-brand-primary text-white rounded hover:bg-brand-dark"
                  >
                    Apply
                  </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioInput;
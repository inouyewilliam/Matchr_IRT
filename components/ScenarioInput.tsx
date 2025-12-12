import React, { useState } from 'react';
import { Scenario } from '../types';
import { Trash2, Settings2 } from 'lucide-react';
import { generateCurve } from '../utils/calculations';

interface ScenarioInputProps {
  scenario: Scenario;
  onUpdate: (updated: Scenario) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
  onSelect: () => void;
  weeksToSimulate: number;
}

const ScenarioInput: React.FC<ScenarioInputProps> = ({
  scenario,
  onUpdate,
  onDelete,
  isActive,
  onSelect,
  weeksToSimulate,
}) => {
  const [totalTarget, setTotalTarget] = useState(scenario.demand.reduce((a, b) => a + b, 0));
  const [isEditing, setIsEditing] = useState(false);

  const handleCurveApply = () => {
    // Use the selected weeksToSimulate to distribute the total target.
    // e.g. 120 hires over 12 weeks = 10 hires/week.
    const newDemand = generateCurve('flat', weeksToSimulate, totalTarget);
    onUpdate({ ...scenario, demand: newDemand });
    setIsEditing(false);
  };

  // Recalculate display sum based on current demand array
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
            className="w-4 h-4 rounded-full shadow-sm" 
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
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Delete Pool"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Current Resources Inputs */}
        <div className="grid grid-cols-1 gap-3 text-sm">
           <div>
              <label className="block text-xs text-slate-500 mb-1">Current TPs</label>
              <input
                type="number"
                min="0"
                value={scenario.currentTalentPartners}
                onChange={(e) => onUpdate({...scenario, currentTalentPartners: parseInt(e.target.value) || 0})}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs focus:ring-1 focus:ring-brand-primary outline-none"
              />
           </div>
        </div>

        {/* Demand Generation */}
        <div className="pt-3 border-t border-slate-100">
           {!isEditing ? (
             <div className="flex items-center justify-between">
                <div>
                   <span className="text-2xl font-bold text-slate-800 font-heading">{currentTotal.toFixed(0)}</span>
                   <span className="text-xs text-slate-500 ml-1">hires</span>
                </div>
                <button 
                   onClick={() => setIsEditing(true)}
                   className="p-1.5 text-brand-primary hover:bg-brand-light rounded-md transition-colors"
                   title="Edit Distribution"
                >
                   <Settings2 size={16} />
                </button>
             </div>
           ) : (
             <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Total Target ({weeksToSimulate} weeks)</label>
                  <input
                    type="number"
                    value={totalTarget}
                    onChange={(e) => setTotalTarget(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-brand-light outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCurveApply}
                    className="flex-1 py-1 text-xs bg-brand-primary text-white rounded hover:bg-brand-dark font-medium"
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
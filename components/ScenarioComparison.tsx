import React, { useState, useMemo } from 'react';
import { GlobalConfig } from '../types';
import { 
  ArrowLeft, 
  Share2, 
  RefreshCw, 
  Users, 
  Briefcase,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ScenarioComparisonProps {
  onBack: () => void;
  totalDemand: number;
  hiringDuration: number;
  totalPools: number;
  currentConfig: GlobalConfig;
}

const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  onBack,
  totalDemand,
  hiringDuration,
  totalPools,
  currentConfig
}) => {
  // Initialize state with current config as baseline
  const [baselineTpCap, setBaselineTpCap] = useState(currentConfig.tpCapacityPerWeek);
  const [baselinePoolsPerSourcer, setBaselinePoolsPerSourcer] = useState(currentConfig.poolsPerSourcer);
  
  // Initialize target with slightly optimized values (example default) or same
  const [targetTpCap, setTargetTpCap] = useState(currentConfig.tpCapacityPerWeek * 1.2); 
  const [targetPoolsPerSourcer, setTargetPoolsPerSourcer] = useState(Math.min(15, currentConfig.poolsPerSourcer + 1));

  const averageMonthlyHires = totalDemand > 0 ? (totalDemand / hiringDuration) * 4.33 : 0;
  const averageWeeklyHires = totalDemand > 0 ? totalDemand / hiringDuration : 0;

  const calculateStaff = (tpCap: number, poolsPerSourcer: number) => {
    const tps = Math.ceil(averageWeeklyHires / tpCap);
    const sourcers = Math.ceil(totalPools / poolsPerSourcer);
    const coordinators = Math.ceil(tps / 4);
    return { tps, sourcers, coordinators, total: tps + sourcers + coordinators };
  };

  const baselineStaff = calculateStaff(baselineTpCap, baselinePoolsPerSourcer);
  const targetStaff = calculateStaff(targetTpCap, targetPoolsPerSourcer);

  const staffDiff = baselineStaff.total - targetStaff.total;
  const improvementPercent = baselineStaff.total > 0 
    ? ((baselineStaff.total - targetStaff.total) / baselineStaff.total) * 100 
    : 0;

  const tpCapImprovement = ((targetTpCap - baselineTpCap) / baselineTpCap) * 100;
  const poolsImprovement = ((targetPoolsPerSourcer - baselinePoolsPerSourcer) / baselinePoolsPerSourcer) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-brand-primary border-b border-brand-dark sticky top-0 z-20 shadow-md text-white">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-heading font-bold tracking-wide">Scenario Comparison</h1>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-80 hover:opacity-100">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        
        {/* Fixed Demand Card */}
        <div className="bg-brand-dark rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-brand-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-brand-light font-bold text-xs uppercase tracking-wider mb-1">Fixed Demand</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-heading font-bold">{averageMonthlyHires.toFixed(0)}</h2>
                <span className="text-lg text-brand-light/80 font-medium">Hires / Month</span>
              </div>
              <p className="text-sm text-brand-light/60 mt-1">Based on {totalDemand.toFixed(0)} total hires over {hiringDuration} weeks</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
               <Briefcase className="text-brand-accent w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          <div>Scenario A: Baseline</div>
          <div className="text-right text-brand-primary">Scenario B: Optimized</div>
        </div>

        {/* Hires per Week per TP Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-slate-800 flex items-center gap-2">
              <Zap size={16} className="text-brand-primary" />
              TP Productivity
            </h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${tpCapImprovement >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {tpCapImprovement > 0 && '+'}{tpCapImprovement.toFixed(0)}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold text-slate-500">
                 <span>Baseline</span>
                 <span>{baselineTpCap.toFixed(1)}</span>
               </div>
               <input 
                 type="range" 
                 min="0.1" max="5" step="0.1"
                 value={baselineTpCap}
                 onChange={(e) => setBaselineTpCap(parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-400"
               />
            </div>
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold text-brand-primary">
                 <span>Target</span>
                 <span>{targetTpCap.toFixed(1)}</span>
               </div>
               <input 
                 type="range" 
                 min="0.1" max="5" step="0.1"
                 value={targetTpCap}
                 onChange={(e) => setTargetTpCap(parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-brand-light/50 rounded-lg appearance-none cursor-pointer accent-brand-primary"
               />
            </div>
          </div>
        </div>

        {/* Concurrent Pools per Sourcer Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-slate-800 flex items-center gap-2">
              <Layers size={16} className="text-brand-accent" />
              Sourcer Load
            </h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${poolsImprovement >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {poolsImprovement > 0 && '+'}{poolsImprovement.toFixed(0)}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold text-slate-500">
                 <span>Baseline</span>
                 <span>{baselinePoolsPerSourcer} pools</span>
               </div>
               <input 
                 type="range" 
                 min="1" max="15" step="1"
                 value={baselinePoolsPerSourcer}
                 onChange={(e) => setBaselinePoolsPerSourcer(parseInt(e.target.value))}
                 className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-400"
               />
            </div>
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold text-brand-primary">
                 <span>Target</span>
                 <span>{targetPoolsPerSourcer} pools</span>
               </div>
               <input 
                 type="range" 
                 min="1" max="15" step="1"
                 value={targetPoolsPerSourcer}
                 onChange={(e) => setTargetPoolsPerSourcer(parseInt(e.target.value))}
                 className="w-full h-1.5 bg-brand-light/50 rounded-lg appearance-none cursor-pointer accent-brand-primary"
               />
            </div>
          </div>
        </div>

        {/* Staff Comparison Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          
          {/* Baseline Result */}
          <div className="bg-slate-800 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between h-40">
             <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Baseline Staff</p>
                <h4 className="text-4xl font-heading font-bold">{baselineStaff.total}</h4>
                <div className="flex gap-3 mt-2 text-xs text-slate-400">
                  <span>{baselineStaff.tps} TPs</span>
                  <span>•</span>
                  <span>{baselineStaff.sourcers} Src</span>
                  <span>•</span>
                  <span>{baselineStaff.coordinators} Coords</span>
                </div>
             </div>
             {/* Simple bar to visualize capacity/load if needed, or just decoration */}
             <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-4">
               <div className="bg-slate-400 h-full w-3/4 rounded-full"></div>
             </div>
          </div>

          {/* Target Result */}
          <div className="bg-brand-primary rounded-xl p-6 text-white shadow-lg flex flex-col justify-between h-40 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-20 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
             
             <div>
                <div className="flex justify-between items-start">
                   <p className="text-brand-light text-xs font-bold uppercase tracking-wider mb-2">Target Staff</p>
                   {staffDiff > 0 && (
                     <span className="bg-white text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                       Save {staffDiff}
                     </span>
                   )}
                </div>
                <h4 className="text-4xl font-heading font-bold">{targetStaff.total}</h4>
                <div className="flex gap-3 mt-2 text-brand-light/80 text-xs">
                  <span>{targetStaff.tps} TPs</span>
                  <span>•</span>
                  <span>{targetStaff.sourcers} Src</span>
                  <span>•</span>
                  <span>{targetStaff.coordinators} Coords</span>
                </div>
             </div>

             <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden mt-4">
               <div 
                 className="bg-brand-accent h-full rounded-full transition-all duration-500"
                 style={{ width: `${Math.min(100, (targetStaff.total / baselineStaff.total) * 100)}%` }}
               ></div>
             </div>
          </div>

        </div>

        {improvementPercent > 0 && (
           <div className="text-center py-2">
              <p className="text-sm font-bold text-emerald-600 bg-emerald-50 inline-block px-4 py-2 rounded-lg border border-emerald-100">
                 ✨ Optimization Opportunity: Reduce headcount by {improvementPercent.toFixed(0)}%
              </p>
           </div>
        )}

      </main>
    </div>
  );
};

export default ScenarioComparison;
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { INITIAL_SCENARIOS, DEFAULT_CONFIG, COLORS } from './constants';
import { GlobalConfig, Scenario } from './types';
import { calculateScenarioMetrics, aggregateResults, generateCurve } from './utils/calculations';
import ScenarioInput from './components/ScenarioInput';
import SettingsPanel from './components/SettingsPanel';
import MetricCard from './components/MetricCard';
import ChartSection from './components/ChartSection';
import DataTable from './components/DataTable';
import ScenarioComparison from './components/ScenarioComparison'; // Import the new component
import { 
  PlusCircle, 
  Users, 
  Search, 
  Briefcase, 
  AlertTriangle, 
  LayoutDashboard,
  Loader2,
  RefreshCw,
  CalendarCheck,
  Database,
  ArrowRightLeft
} from 'lucide-react';

const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  // View state: 'dashboard' or 'comparison'
  const [view, setView] = useState<'dashboard' | 'comparison'>('dashboard');

  const handleUpdateScenario = (updated: Scenario) => {
    setScenarios(scenarios.map(s => s.id === updated.id ? updated : s));
  };

  const handleAddScenario = () => {
    const newId = (Math.max(...scenarios.map(s => parseInt(s.id) || 0), 0) + 1).toString();
    const color = COLORS[scenarios.length % COLORS.length];
    const newScenario: Scenario = {
      id: newId,
      name: `Pool ${newId}`,
      demand: Array(config.hiringDuration).fill(1),
      color,
      currentTalentPartners: 0,
      isManualTP: false,
    };
    setScenarios([...scenarios, newScenario]);
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
    if (selectedScenarioId === id) setSelectedScenarioId(null);
  };

  const handleSyncData = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    const WEBHOOK_URL = 'https://n8n.srv941688.hstgr.cloud/webhook/e2c01e45-b40f-4331-9295-0c3f220eb89f';
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      const dataArray = Array.isArray(rawData) ? rawData : [rawData];
      
      if (dataArray.length === 0 || (dataArray.length === 1 && !dataArray[0])) {
        throw new Error('The database returned no valid data records.');
      }

      const newScenarios: Scenario[] = dataArray.map((item: any, index: number) => {
        const poolName = item['Talent_Pool'] || item['talent pool'] || `Imported Pool ${index + 1}`;
        const totalHires = parseFloat(item['sum_Quantity']) || 0;
        
        return {
          id: `db-${Date.now()}-${index}`,
          name: poolName,
          demand: generateCurve('flat', config.hiringDuration, totalHires),
          color: COLORS[index % COLORS.length],
          currentTalentPartners: 0,
          isManualTP: false,
        };
      });

      setScenarios(newScenarios);
      setSelectedScenarioId(null);
      
    } catch (error: any) {
      console.error('Fetch Error:', error);
      if (error.message === 'Failed to fetch') {
        setSyncError('Connection blocked by CORS or Network error.');
      } else {
        setSyncError(error.message);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [config.hiringDuration]);

  // Automatically trigger sync ONLY on mount
  useEffect(() => {
    handleSyncData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Combined Resource Auto-Distribution Logic
  useEffect(() => {
    const individualResults = scenarios.map(s => calculateScenarioMetrics(s, config));
    const aggregate = aggregateResults(individualResults, scenarios, config);
    
    // 1. Sourcer Auto-calc (Global)
    if (!config.isManualSourcers) {
      const suggestedSourcers = aggregate.maxSourcersNeeded;
      if (config.totalSourcers !== suggestedSourcers) {
        setConfig(prev => ({ ...prev, totalSourcers: suggestedSourcers }));
      }
    }

    // 2. TP Auto-distribution (Per Pool)
    const totalPeakNeeded = aggregate.maxTPsNeeded;
    const totalDemand = scenarios.reduce((sum, s) => sum + s.demand.reduce((a, b) => a + b, 0), 0);

    let needsUpdate = false;
    const updatedScenarios = scenarios.map(s => {
      if (s.isManualTP) return s;
      const scenarioDemand = s.demand.reduce((a, b) => a + b, 0);
      const suggestedTP = totalDemand > 0 ? (scenarioDemand / totalDemand) * totalPeakNeeded : 0;
      
      if (Math.abs(s.currentTalentPartners - suggestedTP) > 0.001) {
        needsUpdate = true;
        return { ...s, currentTalentPartners: suggestedTP };
      }
      return s;
    });

    if (needsUpdate) {
      setScenarios(updatedScenarios);
    }
  }, [
    config.hiringDuration, 
    config.rampUpWeeks, 
    config.tpCapacityPerWeek, 
    config.poolsPerSourcer,
    config.isManualSourcers,
    scenarios.map(s => s.demand.join(',')).join('|'), 
    scenarios.map(s => s.isManualTP).join(',')
  ]);

  const calculatedResults = useMemo(() => {
    const individualResults = scenarios.map(s => ({
       scenarioId: s.id,
       result: calculateScenarioMetrics(s, config)
    }));
    const activeScenarioResult = selectedScenarioId 
      ? individualResults.find(r => r.scenarioId === selectedScenarioId)?.result 
      : null;
    const aggregateResult = aggregateResults(individualResults.map(r => r.result), scenarios, config);
    return { individualResults, activeScenarioResult, aggregateResult };
  }, [scenarios, config, selectedScenarioId]);

  const displayResult = calculatedResults.activeScenarioResult || calculatedResults.aggregateResult;
  const displayTitle = selectedScenarioId 
    ? scenarios.find(s => s.id === selectedScenarioId)?.name || 'Pool'
    : 'All Talent Pools';

  // Render Comparison View if active
  if (view === 'comparison') {
    return (
      <ScenarioComparison 
        onBack={() => setView('dashboard')}
        totalDemand={calculatedResults.aggregateResult.totalDemand}
        hiringDuration={config.hiringDuration}
        totalPools={calculatedResults.aggregateResult.totalPools}
        currentConfig={config}
      />
    );
  }

  // Render Dashboard View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-brand-primary border-b border-brand-dark sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
               <Users className="text-white w-5 h-5" />
             </div>
             <h1 className="text-xl font-heading font-bold text-white tracking-wide">IRT Simulator</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('comparison')}
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm active:scale-95 border border-white/10"
            >
              <ArrowRightLeft size={18} />
              <span>Compare Scenarios</span>
            </button>

            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="group flex items-center gap-2 bg-brand-accent hover:bg-yellow-400 text-brand-dark px-4 py-2 rounded-lg font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              <span>{isSyncing ? 'Syncing...' : 'Sync from DB'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="simulation-content">
        {isSyncing && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-blue-700 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-bold">Connecting to database and fetching talent demand...</span>
          </div>
        )}

        {syncError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Sync Failed</p>
              <p className="text-xs opacity-80">{syncError}</p>
            </div>
          </div>
        )}

        <SettingsPanel config={config} onChange={setConfig} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <MetricCard
            label="Total Hiring Demand"
            value={displayResult.totalDemand.toFixed(0)}
            subValue={`${config.hiringDuration} Week Duration`}
            icon={Briefcase}
            color="text-brand-primary"
            bgColor="bg-brand-light/30"
          />
          <MetricCard
            label="Talent Pools"
            value={displayResult.totalPools}
            subValue="Synced from DB"
            icon={Database}
            color="text-brand-dark"
            bgColor="bg-indigo-50"
          />
          <MetricCard
            label="Peak Resources (TPs)"
            value={displayResult.maxTPsNeeded}
            subValue={`Allocated: ${displayResult.currentTPs.toFixed(1)}`}
            icon={Users}
            color="text-brand-dark"
            bgColor="bg-slate-100"
          />
          <MetricCard
            label="Peak Resources (Src)"
            value={displayResult.maxSourcersNeeded}
            subValue={`Allocated: ${displayResult.currentSourcers}`}
            icon={Search}
            color="text-brand-accent"
            bgColor="bg-yellow-50"
          />
          <MetricCard
            label="Peak Coordinators"
            value={displayResult.maxCoordinatorsNeeded}
            subValue={`1 per 4 TPs`}
            icon={CalendarCheck}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <MetricCard
            label="Capacity Gap"
            value={`${displayResult.capacityGapPercent.toFixed(0)}%`}
            subValue={`Limited by ${displayResult.limitingFactor}`}
            icon={AlertTriangle}
            color={displayResult.capacityGapPercent > 1 ? "text-red-500" : "text-emerald-500"}
            bgColor={displayResult.capacityGapPercent > 1 ? "bg-red-50" : "bg-emerald-50"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
               <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <LayoutDashboard size={14} /> Talent Pools
               </h2>
               <button 
                  onClick={handleAddScenario}
                  className="text-brand-primary hover:text-brand-dark flex items-center gap-1 text-xs font-bold transition-colors"
               >
                  <PlusCircle size={14} /> Add Pool
               </button>
            </div>
            
            <div className={`p-4 rounded-xl border transition-all cursor-pointer ${!selectedScenarioId ? 'bg-brand-primary text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-brand-light'}`}
                 onClick={() => setSelectedScenarioId(null)}>
              <div className="flex items-center justify-between">
                <span className="font-bold">Aggregate View</span>
                {!selectedScenarioId && <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></div>}
              </div>
              <p className="text-[10px] opacity-80 mt-1 uppercase font-bold tracking-tight">Total across all scenarios</p>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {scenarios.map(s => (
                <ScenarioInput
                  key={s.id}
                  scenario={s}
                  onUpdate={handleUpdateScenario}
                  onDelete={handleDeleteScenario}
                  isActive={selectedScenarioId === s.id}
                  onSelect={() => setSelectedScenarioId(s.id)}
                  config={config}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <ChartSection 
              results={displayResult} 
              config={config} 
              title={displayTitle} 
            />
            <DataTable 
              results={displayResult} 
            />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-medium">IRT Capacity Simulation Tool &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
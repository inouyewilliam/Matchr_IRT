import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { INITIAL_SCENARIOS, DEFAULT_CONFIG, COLORS } from './constants';
import { GlobalConfig, Scenario } from './types';
import { calculateScenarioMetrics, aggregateResults, generateCurve } from './utils/calculations';
import ScenarioInput from './components/ScenarioInput';
import SettingsPanel from './components/SettingsPanel';
import MetricCard from './components/MetricCard';
import ChartSection from './components/ChartSection';
import DataTable from './components/DataTable';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  PlusCircle, 
  Users, 
  Search, 
  Briefcase, 
  AlertTriangle, 
  LayoutDashboard,
  Download,
  Loader2,
  DatabaseZap,
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react';

const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

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
      // Standard fetch request
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
      
      // Normalize data: Webhooks might return a single object or an array of objects
      const dataArray = Array.isArray(rawData) ? rawData : [rawData];
      
      if (dataArray.length === 0 || (dataArray.length === 1 && !dataArray[0])) {
        throw new Error('The database returned no valid data records.');
      }

      // Map webhook data to Scenario objects using the specific keys: Talent_Pool, sum_Quantity
      const newScenarios: Scenario[] = dataArray.map((item: any, index: number) => {
        const poolName = item['Talent_Pool'] || item['talent pool'] || `Imported Pool ${index + 1}`;
        const totalHires = parseFloat(item['sum_Quantity']) || 0;
        
        return {
          id: `db-${Date.now()}-${index}`,
          name: poolName,
          demand: generateCurve('flat', config.hiringDuration, totalHires),
          color: COLORS[index % COLORS.length],
          currentTalentPartners: 0,
        };
      });

      setScenarios(newScenarios);
      setSelectedScenarioId(null);
      
    } catch (error: any) {
      console.error('Fetch Error:', error);
      
      if (error.message === 'Failed to fetch') {
        setSyncError('Connection blocked by CORS. Browsers prevent scripts from reading data from different domains unless the server explicitly allows it.');
      } else {
        setSyncError(error.message);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [config.hiringDuration]);

  // Automatically trigger sync on mount
  useEffect(() => {
    handleSyncData();
  }, [handleSyncData]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('simulation-content');
      if (!element) return;
      await document.fonts.ready;
      const originalInputs = element.querySelectorAll('input');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
        onclone: (clonedDoc) => {
             const clonedElement = clonedDoc.getElementById('simulation-content');
             if (clonedElement) clonedElement.style.fontFamily = 'Arial, Helvetica, sans-serif';
             const clonedInputs = clonedDoc.querySelectorAll('input');
             clonedInputs.forEach((clonedInput, index) => {
                 const originalInput = originalInputs[index];
                 if (clonedInput.type !== 'text' && clonedInput.type !== 'number') return;
                 if (!originalInput) return;
                 const style = window.getComputedStyle(originalInput);
                 const span = clonedDoc.createElement('span');
                 span.textContent = (originalInput as HTMLInputElement).value;
                 span.style.fontFamily = 'Arial, Helvetica, sans-serif';
                 span.style.fontSize = style.fontSize;
                 span.style.fontWeight = style.fontWeight;
                 span.style.color = style.color;
                 span.style.backgroundColor = style.backgroundColor;
                 span.style.border = style.border;
                 span.style.borderRadius = style.borderRadius;
                 span.style.padding = style.padding;
                 span.style.margin = style.margin;
                 span.style.width = style.width;
                 span.style.height = style.height;
                 span.style.textAlign = style.textAlign;
                 span.style.display = 'inline-flex';
                 span.style.alignItems = 'center';
                 span.style.boxSizing = 'border-box';
                 if (style.textAlign === 'center') span.style.justifyContent = 'center';
                 if (clonedInput.parentNode) {
                     clonedInput.parentNode.insertBefore(span, clonedInput);
                     (clonedInput as HTMLElement).style.display = 'none';
                 }
             });
             const svgTexts = clonedDoc.querySelectorAll('text');
             svgTexts.forEach((text: SVGTextElement) => {
                 text.style.fontFamily = 'Arial, Helvetica, sans-serif';
             });
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`irt-capacity-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

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
              onClick={handleSyncData}
              disabled={isSyncing}
              className="group flex items-center gap-2 bg-brand-accent hover:bg-yellow-400 text-brand-dark px-4 py-2 rounded-lg font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              <span>{isSyncing ? 'Syncing...' : 'Sync from DB'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition-all border border-white/20 active:scale-95 disabled:opacity-50"
            >
              {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              <span>Export PDF</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Total Hiring Demand"
            value={displayResult.totalDemand.toFixed(0)}
            subValue={`${config.hiringDuration} Week Duration`}
            icon={Briefcase}
            color="text-brand-primary"
            bgColor="bg-brand-light/30"
          />
          <MetricCard
            label="Peak Resources (TPs)"
            value={displayResult.maxTPsNeeded}
            subValue={`Current: ${displayResult.currentTPs}`}
            icon={Users}
            color="text-brand-dark"
            bgColor="bg-slate-100"
          />
          <MetricCard
            label="Peak Resources (Src)"
            value={displayResult.maxSourcersNeeded}
            subValue={`Current: ${displayResult.currentSourcers}`}
            icon={Search}
            color="text-brand-accent"
            bgColor="bg-yellow-50"
          />
          <MetricCard
            label="Capacity Gap"
            value={`${displayResult.capacityGapPercent.toFixed(0)}%`}
            subValue={`Limited by ${displayResult.limitingFactor}`}
            icon={AlertTriangle}
            color={displayResult.capacityGapPercent > 20 ? "text-red-500" : "text-emerald-500"}
            bgColor={displayResult.capacityGapPercent > 20 ? "bg-red-50" : "bg-emerald-50"}
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
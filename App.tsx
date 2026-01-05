import React, { useState, useMemo } from 'react';
import { INITIAL_SCENARIOS, DEFAULT_CONFIG, COLORS } from './constants';
import { GlobalConfig, Scenario } from './types';
import { calculateScenarioMetrics, aggregateResults } from './utils/calculations';
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
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleUpdateScenario = (updated: Scenario) => {
    setScenarios(scenarios.map(s => s.id === updated.id ? updated : s));
  };

  const handleAddScenario = () => {
    const newId = (Math.max(...scenarios.map(s => parseInt(s.id))) + 1).toString();
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
             if (clonedElement) {
                 clonedElement.style.fontFamily = 'Arial, Helvetica, sans-serif';
             }
             
             const clonedInputs = clonedDoc.querySelectorAll('input');
             clonedInputs.forEach((clonedInput, index) => {
                 const originalInput = originalInputs[index];
                 if (clonedInput.type !== 'text' && clonedInput.type !== 'number') return;
                 if (!originalInput) return;

                 const style = window.getComputedStyle(originalInput);
                 const span = clonedDoc.createElement('span');
                 span.textContent = originalInput.value;
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
                 
                 if (style.textAlign === 'center') {
                     span.style.justifyContent = 'center';
                 }
                 
                 if (clonedInput.parentNode) {
                     clonedInput.parentNode.insertBefore(span, clonedInput);
                     clonedInput.style.display = 'none';
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
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main 
        id="simulation-content"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <SettingsPanel config={config} onChange={setConfig} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-4">
             <div className="flex items-center justify-between mb-2">
               <h3 className="font-heading font-semibold text-slate-700">Talent Pools</h3>
               <button 
                 onClick={handleAddScenario}
                 className="text-brand-primary hover:text-brand-dark p-1 hover:bg-brand-light/30 rounded transition-colors"
               >
                 <PlusCircle size={20} />
               </button>
             </div>
             
             <div 
               className={`p-3 rounded-xl border cursor-pointer transition-all ${
                 selectedScenarioId === null 
                 ? 'bg-brand-dark text-white border-brand-dark shadow-md' 
                 : 'bg-white border-slate-200 text-slate-600 hover:border-brand-light hover:shadow-sm'
               }`}
               onClick={() => setSelectedScenarioId(null)}
             >
                <div className="flex items-center gap-3">
                   <LayoutDashboard size={18} />
                   <span className="font-medium">All Pools (Aggregate)</span>
                </div>
             </div>

             <div className="space-y-3">
               {scenarios.map(scenario => (
                 <ScenarioInput
                   key={scenario.id}
                   scenario={scenario}
                   onUpdate={handleUpdateScenario}
                   onDelete={handleDeleteScenario}
                   isActive={selectedScenarioId === scenario.id}
                   onSelect={() => setSelectedScenarioId(scenario.id)}
                   config={config}
                 />
               ))}
             </div>
          </div>

          <div className="lg:col-span-9 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
               <MetricCard 
                 label="Total Demand" 
                 value={displayResult.totalDemand.toFixed(0)} 
                 subValue="hires / period"
                 icon={Briefcase}
                 color="text-brand-primary"
                 bgColor="bg-brand-light/50"
               />
               <MetricCard 
                 label="Peak Weekly" 
                 value={displayResult.peakWeeklyDemand.toFixed(1)} 
                 subValue="hires / week"
                 icon={AlertTriangle}
                 color="text-brand-primary"
                 bgColor="bg-brand-light/50"
               />
               <MetricCard 
                 label="Max TPs" 
                 value={displayResult.maxTPsNeeded} 
                 subValue="headcount"
                 icon={Users}
                 color="text-brand-dark"
                 bgColor="bg-slate-200"
               />
               <MetricCard 
                 label="Max Sourcers" 
                 value={displayResult.maxSourcersNeeded} 
                 subValue="headcount"
                 icon={Search}
                 color="text-brand-accent"
                 bgColor="bg-yellow-50"
               />
               <MetricCard 
                 label="Capacity Gap" 
                 value={`${displayResult.capacityGapPercent.toFixed(1)}%`} 
                 subValue="unmet demand"
                 icon={AlertTriangle}
                 color="text-red-600"
                 bgColor="bg-red-50"
               />
            </div>

            <ChartSection 
              results={displayResult} 
              config={config} 
              title={displayTitle}
            />

            <DataTable results={displayResult} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
import React from 'react';
import { SimulationResult } from '../types';

interface DataTableProps {
  results: SimulationResult;
}

const DataTable: React.FC<DataTableProps> = ({ results }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-96">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-heading font-semibold text-slate-800">Weekly Breakdown</h3>
        <div className="flex gap-4">
           <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-brand-light"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Ramp Period</span>
           </div>
        </div>
      </div>
      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-sm text-left font-sans">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-bold">Week</th>
              <th className="px-6 py-4 font-bold text-brand-primary">Demand (Hires)</th>
              <th className="px-6 py-4 font-bold text-brand-dark">TPs Needed</th>
              <th className="px-6 py-4 font-bold text-brand-accent">Sourcers Needed</th>
              <th className="px-6 py-4 font-bold text-blue-600">Coordinators</th>
              <th className="px-6 py-4 font-bold">Capacity Gap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.weeklyData.map((row) => (
              <tr key={row.week} className={`hover:bg-slate-50 transition-colors ${row.isRampUp ? 'bg-slate-50/50' : ''}`}>
                <td className="px-6 py-3 font-bold text-slate-900 flex items-center gap-2">
                   W{row.week}
                   {row.isRampUp && <span className="text-[8px] bg-brand-light text-brand-primary px-1 rounded font-black uppercase">Ramp</span>}
                </td>
                <td className="px-6 py-3 text-brand-primary font-bold">{row.demand.toFixed(1)}</td>
                <td className="px-6 py-3 text-brand-dark font-bold">{row.tpsNeeded}</td>
                <td className="px-6 py-3 text-brand-accent font-bold">{row.sourcersNeeded}</td>
                <td className="px-6 py-3 text-blue-600 font-bold">{row.coordinatorsNeeded}</td>
                <td className="px-6 py-3">
                  {!row.isRampUp && row.gap > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase">
                      -{(row.gap * 100).toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
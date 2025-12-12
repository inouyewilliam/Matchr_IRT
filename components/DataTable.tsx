import React from 'react';
import { SimulationResult } from '../types';

interface DataTableProps {
  results: SimulationResult;
}

const DataTable: React.FC<DataTableProps> = ({ results }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-96">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-heading font-semibold text-slate-800">Weekly Breakdown</h3>
      </div>
      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-sm text-left font-sans">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-medium">Week</th>
              <th className="px-6 py-3 font-medium text-brand-primary">Demand (Hires)</th>
              <th className="px-6 py-3 font-medium text-brand-dark">TPs Needed</th>
              <th className="px-6 py-3 font-medium text-brand-accent">Sourcers Needed</th>
              <th className="px-6 py-3 font-medium">Capacity Gap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.weeklyData.map((row) => (
              <tr key={row.week} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 font-medium text-slate-900">W{row.week}</td>
                <td className="px-6 py-3 text-brand-primary font-medium">{row.demand.toFixed(1)}</td>
                <td className="px-6 py-3 text-brand-dark font-medium">{row.tpsNeeded}</td>
                <td className="px-6 py-3 text-brand-accent font-medium">{row.sourcersNeeded}</td>
                <td className="px-6 py-3">
                  {row.gap > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      -{(row.gap * 100).toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
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
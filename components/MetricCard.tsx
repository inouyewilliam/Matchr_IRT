import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  color: string; // Tailwind text color class
  bgColor: string; // Tailwind bg color class
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, icon: Icon, color, bgColor }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1 font-sans">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900 font-heading">{value}</h4>
        {subValue && <p className="text-xs text-slate-400 mt-1 font-sans">{subValue}</p>}
      </div>
      <div className={`p-2.5 rounded-lg ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  );
};

export default MetricCard;
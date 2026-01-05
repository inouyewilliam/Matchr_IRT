import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ReferenceLine
} from 'recharts';
import { SimulationResult, GlobalConfig } from '../types';

interface ChartSectionProps {
  results: SimulationResult;
  config: GlobalConfig;
  title: string;
}

const ChartSection: React.FC<ChartSectionProps> = ({ results, config, title }) => {
  const chartData = results.weeklyData.map(d => {
      return {
          name: `W${d.week}`,
          Demand: d.demand,
          'TPs Needed': d.tpsNeeded,
          'Sourcers Needed': d.sourcersNeeded,
          'Max Capacity': d.capacity
      };
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
      <h3 className="text-lg font-heading font-semibold text-brand-primary mb-4">{title} - Demand vs. Capacity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            tick={{fontSize: 10, fill: '#64748b'}} 
            // Fix: Use the length of results.weeklyData as the total simulation duration since weeksToSimulate is not in GlobalConfig
            interval={results.weeklyData.length <= 15 ? 0 : 3} 
            tickLine={false}
            axisLine={{stroke: '#cbd5e1'}}
          />
          <YAxis 
            yAxisId="left" 
            label={{ value: 'Hires / Week', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12, fontFamily: 'Manrope' } }}
            tick={{fontSize: 12, fill: '#64748b'}}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            label={{ value: 'Headcount Needed', angle: 90, position: 'insideRight', style: { fill: '#64748b', fontSize: 12, fontFamily: 'Manrope' } }}
            tick={{fontSize: 12, fill: '#64748b'}}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Manrope' }}
            labelStyle={{ color: '#5B28B9', marginBottom: '4px', fontWeight: 600 }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            wrapperStyle={{ paddingTop: '10px', fontFamily: 'Manrope' }} 
          />
          
          {/* Demand - Brand Primary Purple */}
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="Demand" 
            fill="#E6D9FF" 
            stroke="#5B28B9" 
            strokeWidth={3}
            fillOpacity={0.6}
            name="Hiring Demand"
          />

           {/* Max Capacity Line - Green Dotted */}
           <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="Max Capacity" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Hiring Capacity"
          />

          {/* TP Requirements */}
          <Line 
            yAxisId="right"
            type="step" 
            dataKey="TPs Needed" 
            stroke="#241049" 
            strokeWidth={2}
            dot={false}
            name="TPs Required"
          />
          
          {/* Current TPs - Reference Line */}
          <ReferenceLine 
            yAxisId="right" 
            y={results.currentTPs} 
            stroke="#241049" 
            strokeDasharray="3 3" 
            label={{ value: 'Curr TPs', position: 'insideTopRight', fill: '#241049', fontSize: 10 }} 
          />

          {/* Sourcer Requirements */}
          <Line 
            yAxisId="right"
            type="step" 
            dataKey="Sourcers Needed" 
            stroke="#F4B942" 
            strokeWidth={2}
            dot={false}
            name="Sourcers Required"
          />

          {/* Current Sourcers - Reference Line */}
          <ReferenceLine 
            yAxisId="right" 
            y={results.currentSourcers} 
            stroke="#F4B942" 
            strokeDasharray="3 3" 
            label={{ value: 'Curr Src', position: 'insideBottomRight', fill: '#F4B942', fontSize: 10 }} 
          />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartSection;
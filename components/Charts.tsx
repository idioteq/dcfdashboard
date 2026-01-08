
import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { YearProjection } from '../types';

interface ChartsProps {
  projections: YearProjection[];
}

const Charts: React.FC<ChartsProps> = ({ projections }) => {
  // Filter for display: years 1-15 to see detail, then samples
  const displayData = projections.filter((p, idx) => p.year <= 15 || p.year % 10 === 0);

  const colors: any = {
    'Stage 1': '#3b82f6', // blue
    'Stage 2': '#8b5cf6', // violet
    'Stage 3': '#f59e0b', // amber
    'Terminal': '#10b981' // emerald
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 h-80">
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Projected Free Cash Flows (FCFF)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
              labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#f1f5f9' }}
              formatter={(val: number) => [`$${val.toFixed(2)}M`, 'FCFF']}
            />
            <Bar dataKey="fcff">
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[entry.stage] || '#334155'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 h-80">
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Revenue Growth Profile</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#f1f5f9' }}
              formatter={(val: number) => [`${val.toFixed(2)}%`, 'Growth Rate']}
            />
            <Line type="monotone" dataKey="growthRate" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;

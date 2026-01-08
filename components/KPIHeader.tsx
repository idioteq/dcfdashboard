
import React from 'react';
import { DCFResult } from '../types';

interface KPIHeaderProps {
  result: DCFResult;
  currentPrice: number;
}

const KPIHeader: React.FC<KPIHeaderProps> = ({ result, currentPrice }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const explicitPct = (result.pvExplicit / result.enterpriseValue) * 100;
  const terminalPct = (result.pvTerminal / result.enterpriseValue) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
      <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Intrinsic Value</div>
        <div className="flex items-end gap-3">
          <div className="text-3xl font-bold text-emerald-400 mono">{formatCurrency(result.intrinsicValue)}</div>
          <div className={`text-sm font-semibold mb-1 ${result.upside > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {result.upside > 0 ? '▲' : '▼'} {Math.abs(result.upside).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Current Price</div>
        <div className="text-3xl font-bold text-slate-100 mono">{formatCurrency(currentPrice)}</div>
      </div>

      <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Explicit PV %</div>
        <div className="text-3xl font-bold text-blue-400 mono">{explicitPct.toFixed(1)}%</div>
      </div>

      <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Terminal Value %</div>
        <div className="text-3xl font-bold text-amber-400 mono">{terminalPct.toFixed(1)}%</div>
      </div>
    </div>
  );
};

export default KPIHeader;

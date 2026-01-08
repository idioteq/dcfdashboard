
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KPIHeader from './components/KPIHeader';
import Charts from './components/Charts';
import SensitivityTable from './components/SensitivityTable';
import { FinancialData, ModelAssumptions } from './types';
import { calculateDCF, generateSensitivityMatrix } from './services/dcfEngine';
import { fetchFinancialData } from './services/gemini';

const INITIAL_FINANCIALS: FinancialData = {
  ticker: 'AAPL',
  revenueTTM: 391000,
  ebit: 114000,
  taxRate: 15.8,
  cash: 161000,
  debt: 108000,
  shares: 15200,
  price: 228.00
};

const INITIAL_ASSUMPTIONS: ModelAssumptions = {
  stage1Growth: 12.0,
  stage2Growth: 8.0,
  targetMargin: 29.0,
  terminalGrowth: 2.5,
  initialWacc: 9.5,
  terminalWacc: 7.5,
  salesToCapital: 2.2
};

const App: React.FC = () => {
  const [tickerInput, setTickerInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [financials, setFinancials] = useState<FinancialData>(INITIAL_FINANCIALS);
  const [assumptions, setAssumptions] = useState<ModelAssumptions>(INITIAL_ASSUMPTIONS);
  const [error, setError] = useState<string | null>(null);

  const dcfResult = useMemo(() => {
    return calculateDCF(financials, assumptions);
  }, [financials, assumptions]);

  const sensitivityMatrix = useMemo(() => {
    return generateSensitivityMatrix(financials, assumptions);
  }, [financials, assumptions]);

  const handleFetchData = async () => {
    if (!tickerInput) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFinancialData(tickerInput);
      setFinancials(data);
      // Heuristic: adjust initial assumptions slightly for higher/lower growth tickers
      setAssumptions(prev => ({
        ...prev,
        stage1Growth: data.revenueTTM > 0 ? 10 : prev.stage1Growth
      }));
    } catch (err: any) {
      setError("Failed to fetch data. Please adjust inputs manually.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar 
        financials={financials} 
        assumptions={assumptions} 
        onFinancialChange={setFinancials} 
        onAssumptionChange={setAssumptions} 
      />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Institutional <span className="text-blue-500">DCF Engine</span></h1>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Enter Ticker (AAPL, TSLA...)" 
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
              className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 mono"
              onKeyDown={(e) => e.key === 'Enter' && handleFetchData()}
            />
            <button 
              onClick={handleFetchData}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Run Analysis'}
            </button>
          </div>
        </header>

        {error && (
          <div className="m-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-lg text-sm flex items-center gap-2">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {error}
          </div>
        )}

        <KPIHeader result={dcfResult} currentPrice={financials.price} />

        <Charts projections={dcfResult.projections} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pb-20">
          {/* Valuation Waterfall */}
          <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-6">Valuation Waterfall</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-400">PV of Explicit Period (1-60y)</span>
                <span className="font-bold text-blue-400 mono">${dcfResult.pvExplicit.toLocaleString(undefined, { maximumFractionDigits: 0 })}M</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-400">PV of Terminal Value</span>
                <span className="font-bold text-amber-400 mono">${dcfResult.pvTerminal.toLocaleString(undefined, { maximumFractionDigits: 0 })}M</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold border-b border-slate-700 py-1 bg-slate-900/30 px-2 rounded">
                <span>Enterprise Value</span>
                <span className="mono">${dcfResult.enterpriseValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}M</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-400">(+) Cash & Marketable Securities</span>
                <span className="text-emerald-400 mono">+${financials.cash.toLocaleString()}M</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-400">(-) Total Debt</span>
                <span className="text-red-400 mono">-${financials.debt.toLocaleString()}M</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-b-2 border-slate-600 py-2">
                <span>Equity Value</span>
                <span className="mono">${dcfResult.equityValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}M</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-400 pt-2 italic">
                <span>Divided by {financials.shares}M Shares</span>
                <span className="text-emerald-400 text-lg font-bold mono">${dcfResult.intrinsicValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <SensitivityTable 
            matrix={sensitivityMatrix} 
            baseWacc={assumptions.initialWacc} 
            baseGrowth={assumptions.terminalGrowth} 
          />
        </div>

        {/* Floating Tooltip Footer */}
        <footer className="fixed bottom-0 right-0 left-80 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 py-3 px-8 flex justify-between items-center z-10">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-slate-400">High Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500"></div>
              <span className="text-xs text-slate-400">Transition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs text-slate-400">Fade (Convergence)</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">DAMODARAN 4-STAGE INTRINSIC VALUE MODEL | REAL-TIME CALCULATIONS</div>
        </footer>
      </div>
    </div>
  );
};

export default App;

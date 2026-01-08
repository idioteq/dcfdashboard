
import React from 'react';
import { FinancialData, ModelAssumptions } from '../types';

interface SidebarProps {
  financials: FinancialData;
  assumptions: ModelAssumptions;
  onFinancialChange: (data: FinancialData) => void;
  onAssumptionChange: (data: ModelAssumptions) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ financials, assumptions, onFinancialChange, onAssumptionChange }) => {
  const updateFin = (key: keyof FinancialData, val: number) => {
    onFinancialChange({ ...financials, [key]: val });
  };

  const updateAsm = (key: keyof ModelAssumptions, val: number) => {
    onAssumptionChange({ ...assumptions, [key]: val });
  };

  const InputField = ({ label, value, onChange, prefix = "", suffix = "" }: any) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </label>
      <div className="flex items-center bg-slate-800 border border-slate-700 rounded-md px-3 py-2">
        {prefix && <span className="text-slate-500 mr-2">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="bg-transparent w-full text-slate-100 focus:outline-none mono"
        />
        {suffix && <span className="text-slate-500 ml-2">{suffix}</span>}
      </div>
    </div>
  );

  const SliderField = ({ label, value, min, max, step, onChange, suffix = "%" }: any) => (
    <div className="mb-6">
      <div className="flex justify-between mb-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
        <span className="text-xs text-blue-400 font-bold mono">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );

  return (
    <div className="w-80 h-full border-r border-slate-800 bg-slate-900/50 p-6 overflow-y-auto">
      <h2 className="text-lg font-bold mb-6 text-white border-b border-slate-800 pb-2">Current Financials</h2>
      
      <InputField label="Revenue (TTM)" value={financials.revenueTTM} onChange={(v: number) => updateFin('revenueTTM', v)} prefix="$" suffix="M" />
      <InputField label="Operating Income (EBIT)" value={financials.ebit} onChange={(v: number) => updateFin('ebit', v)} prefix="$" suffix="M" />
      <InputField label="Tax Rate" value={financials.taxRate} onChange={(v: number) => updateFin('taxRate', v)} suffix="%" />
      <InputField label="Cash & Marketables" value={financials.cash} onChange={(v: number) => updateFin('cash', v)} prefix="$" suffix="M" />
      <InputField label="Total Debt" value={financials.debt} onChange={(v: number) => updateFin('debt', v)} prefix="$" suffix="M" />
      <InputField label="Shares Outstanding" value={financials.shares} onChange={(v: number) => updateFin('shares', v)} suffix="M" />
      
      <h2 className="text-lg font-bold mt-10 mb-6 text-white border-b border-slate-800 pb-2">Growth Assumptions</h2>
      
      <SliderField label="Stage 1 Growth (1-5y)" value={assumptions.stage1Growth} min={-50} max={100} step={0.5} onChange={(v: number) => updateAsm('stage1Growth', v)} />
      <SliderField label="Stage 2 Growth (6-10y)" value={assumptions.stage2Growth} min={-10} max={50} step={0.5} onChange={(v: number) => updateAsm('stage2Growth', v)} />
      <SliderField label="Terminal Growth" value={assumptions.terminalGrowth} min={0} max={5} step={0.1} onChange={(v: number) => updateAsm('terminalGrowth', v)} />
      <SliderField label="Target Margin" value={assumptions.targetMargin} min={0} max={100} step={1} onChange={(v: number) => updateAsm('targetMargin', v)} />
      
      <h2 className="text-lg font-bold mt-10 mb-6 text-white border-b border-slate-800 pb-2">Cost of Capital</h2>
      
      <SliderField label="Initial WACC" value={assumptions.initialWacc} min={5} max={25} step={0.1} onChange={(v: number) => updateAsm('initialWacc', v)} />
      <SliderField label="Terminal WACC" value={assumptions.terminalWacc} min={5} max={15} step={0.1} onChange={(v: number) => updateAsm('terminalWacc', v)} />
      <InputField label="Sales to Capital Ratio" value={assumptions.salesToCapital} onChange={(v: number) => updateAsm('salesToCapital', v)} />
    </div>
  );
};

export default Sidebar;

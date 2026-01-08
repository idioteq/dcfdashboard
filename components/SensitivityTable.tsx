
import React from 'react';

interface SensitivityTableProps {
  matrix: number[][];
  baseWacc: number;
  baseGrowth: number;
}

const SensitivityTable: React.FC<SensitivityTableProps> = ({ matrix, baseWacc, baseGrowth }) => {
  const waccSteps = [-1, -0.5, 0, 0.5, 1];
  const growthSteps = [0.5, 0, -0.5]; // Reversed for Y-axis (high growth top)

  return (
    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 overflow-hidden">
      <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 text-center">Sensitivity Analysis: WACC vs Terminal Growth</h3>
      <div className="flex flex-col items-center">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-slate-700 bg-slate-900/50 text-[10px] text-slate-500 uppercase">Growth \ WACC</th>
                {waccSteps.map(step => (
                  <th key={step} className="p-2 border border-slate-700 bg-slate-900/50 text-xs font-bold text-blue-400 mono">
                    {(baseWacc + step).toFixed(1)}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {growthSteps.map((gStep, gIdx) => {
                // Adjusting matrix indexing to match growthSteps reversal if needed
                // matrix is [growthStepIdx][waccStepIdx]
                const actualGIdx = gStep === 0.5 ? 0 : gStep === 0 ? 1 : 2;
                return (
                  <tr key={gStep}>
                    <td className="p-2 border border-slate-700 bg-slate-900/50 text-xs font-bold text-amber-400 mono text-center">
                      {(baseGrowth + gStep).toFixed(1)}%
                    </td>
                    {matrix[actualGIdx].map((val, wIdx) => {
                      const isBase = waccSteps[wIdx] === 0 && gStep === 0;
                      return (
                        <td key={wIdx} className={`p-3 border border-slate-700 text-center text-xs mono ${isBase ? 'bg-blue-500/10 border-blue-500/50 font-bold' : ''}`}>
                          ${val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-[10px] text-slate-500 italic">Values represent Intrinsic Value per share based on variations.</div>
      </div>
    </div>
  );
};

export default SensitivityTable;

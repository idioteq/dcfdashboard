
export interface FinancialData {
  ticker: string;
  revenueTTM: number;
  ebit: number;
  taxRate: number;
  cash: number;
  debt: number;
  shares: number;
  price: number;
}

export interface ModelAssumptions {
  stage1Growth: number; // 5 years
  stage2Growth: number; // 5 years
  targetMargin: number;
  terminalGrowth: number;
  initialWacc: number;
  terminalWacc: number;
  salesToCapital: number;
}

export interface YearProjection {
  year: number;
  revenue: number;
  ebit: number;
  ebiat: number;
  reinvestment: number;
  fcff: number;
  discountFactor: number;
  pv: number;
  stage: 'Stage 1' | 'Stage 2' | 'Stage 3' | 'Terminal';
  growthRate: number;
}

export interface DCFResult {
  projections: YearProjection[];
  pvExplicit: number;
  pvTerminal: number;
  enterpriseValue: number;
  equityValue: number;
  intrinsicValue: number;
  upside: number;
}

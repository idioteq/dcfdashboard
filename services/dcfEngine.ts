
import { FinancialData, ModelAssumptions, YearProjection, DCFResult } from '../types';

export const calculateDCF = (
  financials: FinancialData,
  assumptions: ModelAssumptions
): DCFResult => {
  const projections: YearProjection[] = [];
  
  let currentRevenue = financials.revenueTTM;
  let currentEbit = financials.ebit;
  let cumulativeDiscountFactor = 1;
  let totalPVExplicit = 0;

  // Damodaran Logic: 4 Stages
  // Stage 1 (1-5), Stage 2 (6-10), Stage 3 (11-60 Fade), Stage 4 (Terminal)
  
  const STAGE1_LEN = 5;
  const STAGE2_LEN = 5;
  const STAGE3_LEN = 50;

  for (let y = 1; y <= STAGE1_LEN + STAGE2_LEN + STAGE3_LEN; y++) {
    let growthRate: number;
    let margin: number;
    let wacc: number;
    let stage: YearProjection['stage'];

    if (y <= STAGE1_LEN) {
      growthRate = assumptions.stage1Growth / 100;
      stage = 'Stage 1';
      wacc = assumptions.initialWacc / 100;
      margin = financials.ebit / financials.revenueTTM;
    } else if (y <= STAGE1_LEN + STAGE2_LEN) {
      growthRate = assumptions.stage2Growth / 100;
      stage = 'Stage 2';
      wacc = assumptions.initialWacc / 100;
      margin = assumptions.targetMargin / 100;
    } else {
      // Fade Period: Transition from Stage 2 Growth to Terminal Growth
      const fadeStep = (y - (STAGE1_LEN + STAGE2_LEN)) / STAGE3_LEN;
      growthRate = (assumptions.stage2Growth / 100) * (1 - fadeStep) + (assumptions.terminalGrowth / 100) * fadeStep;
      stage = 'Stage 3';
      wacc = (assumptions.initialWacc / 100) * (1 - fadeStep) + (assumptions.terminalWacc / 100) * fadeStep;
      margin = assumptions.targetMargin / 100;
    }

    const prevRevenue = currentRevenue;
    currentRevenue *= (1 + growthRate);
    const revDelta = currentRevenue - prevRevenue;
    
    // EBIT based on target margin
    const ebit = currentRevenue * margin;
    const ebiat = ebit * (1 - (financials.taxRate / 100));
    
    // Reinvestment = ΔSales / (Sales/Capital Ratio)
    const reinvestment = revDelta / assumptions.salesToCapital;
    const fcff = ebiat - reinvestment;

    cumulativeDiscountFactor *= (1 / (1 + wacc));
    const pv = fcff * cumulativeDiscountFactor;

    projections.push({
      year: y,
      revenue: currentRevenue,
      ebit,
      ebiat,
      reinvestment,
      fcff,
      discountFactor: cumulativeDiscountFactor,
      pv,
      stage,
      growthRate: growthRate * 100
    });

    totalPVExplicit += pv;
  }

  // Stage 4: Terminal Value
  const lastYear = projections[projections.length - 1];
  const terminalGrowth = assumptions.terminalGrowth / 100;
  const terminalWacc = assumptions.terminalWacc / 100;
  
  // Perpetuity Growth Formula
  // TV = FCFF_n+1 / (WACC - g)
  // To be conservative, we assume reinvestment in terminal year = (Growth / ROIC) * EBIAT
  // Using Damodaran's simplification: Terminal FCFF = EBIAT * (1 - g/WACC)
  const terminalEbiat = lastYear.ebiat * (1 + terminalGrowth);
  const terminalFCFF = terminalEbiat * (1 - (terminalGrowth / terminalWacc));
  const terminalValue = terminalFCFF / (terminalWacc - terminalGrowth);
  const pvTerminal = terminalValue * lastYear.discountFactor;

  const enterpriseValue = totalPVExplicit + pvTerminal;
  const equityValue = enterpriseValue + financials.cash - financials.debt;
  const intrinsicValue = equityValue / financials.shares;
  const upside = ((intrinsicValue / financials.price) - 1) * 100;

  return {
    projections,
    pvExplicit: totalPVExplicit,
    pvTerminal,
    enterpriseValue,
    equityValue,
    intrinsicValue,
    upside
  };
};

export const generateSensitivityMatrix = (
  financials: FinancialData,
  assumptions: ModelAssumptions
) => {
  const waccBase = assumptions.initialWacc;
  const growthBase = assumptions.terminalGrowth;
  
  const waccSteps = [-1, -0.5, 0, 0.5, 1];
  const growthSteps = [-0.5, 0, 0.5];
  
  return growthSteps.map(gStep => {
    return waccSteps.map(wStep => {
      const adjAssumptions = {
        ...assumptions,
        initialWacc: waccBase + wStep,
        terminalWacc: assumptions.terminalWacc + wStep,
        terminalGrowth: growthBase + gStep
      };
      return calculateDCF(financials, adjAssumptions).intrinsicValue;
    });
  });
};

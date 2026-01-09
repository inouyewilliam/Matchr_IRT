import { GlobalConfig, Scenario, SimulationResult, WeeklyResult } from '../types';

export const calculateScenarioMetrics = (
  scenario: Scenario,
  config: GlobalConfig
): SimulationResult => {
  const { hiringDuration, rampUpWeeks, poolsPerSourcer } = config;
  const totalWeeks = hiringDuration + rampUpWeeks;

  const totalHiresTarget = scenario.demand.reduce((a, b) => a + b, 0);
  const hiresPerWeek = totalHiresTarget > 0 ? totalHiresTarget / hiringDuration : 0;
  const hiringDemand = new Array(hiringDuration).fill(hiresPerWeek);

  const rampResourceDemand = hiringDemand[0] || 0;

  // Sourcing capacity: A single pool needs 1/poolsPerSourcer sourcers when active
  const tpMaxHires = (scenario.currentTalentPartners || 0) * config.tpCapacityPerWeek;
  
  // Limiting factor logic: In this model, we primarily treat TP as the closer bottleneck,
  // but we track if we have enough sourcer headcount to cover the pool.
  const actualCapacity = tpMaxHires; 
  const limitingFactor = 'Talent Partners';

  const weeklyData: WeeklyResult[] = [];

  for (let i = 0; i < totalWeeks; i++) {
    const isRampUp = i < rampUpWeeks;
    const demand = isRampUp ? 0 : hiringDemand[i - rampUpWeeks];
    const resourceBasis = isRampUp ? rampResourceDemand : demand;

    const tpsNeeded = Math.ceil(resourceBasis / config.tpCapacityPerWeek);
    // New logic: 1 active pool requires 1/poolsPerSourcer sourcer headcount
    const rawSourcersNeeded = (resourceBasis > 0 || isRampUp && rampResourceDemand > 0) ? (1 / poolsPerSourcer) : 0;

    weeklyData.push({
      week: i + 1,
      isRampUp,
      demand,
      sourcersNeeded: Math.ceil(rawSourcersNeeded * 10) / 10, // Keep precision for individual pools
      tpsNeeded: tpsNeeded,
      coordinatorsNeeded: Math.ceil(tpsNeeded / 4),
      capacity: actualCapacity,
      gap: demand > 0 ? Math.max(0, (demand - actualCapacity) / demand) : 0,
    });
  }

  const totalDemand = hiringDemand.reduce((a, b) => a + b, 0);
  const peakWeeklyDemand = Math.max(...hiringDemand, 0);
  const maxTPsNeeded = Math.max(...weeklyData.map(d => d.tpsNeeded), 0);
  const maxSourcersNeeded = Math.ceil(Math.max(...weeklyData.map(d => d.sourcersNeeded), 0));
  const maxCoordinatorsNeeded = Math.max(...weeklyData.map(d => d.coordinatorsNeeded), 0);
  
  const capacityGapPercent = totalDemand > 0 
    ? Math.max(0, ((totalDemand - (actualCapacity * hiringDuration)) / totalDemand) * 100)
    : 0;

  return {
    totalDemand,
    peakWeeklyDemand,
    maxTPsNeeded,
    maxSourcersNeeded,
    maxCoordinatorsNeeded,
    capacityGapPercent,
    weeklyData,
    maxCapacity: actualCapacity,
    limitingFactor,
    currentTPs: scenario.currentTalentPartners,
    currentSourcers: config.totalSourcers,
    totalPools: 1,
  };
};

export const aggregateResults = (results: SimulationResult[], scenarios: Scenario[], config: GlobalConfig): SimulationResult => {
  if (results.length === 0) {
    return {
      totalDemand: 0, peakWeeklyDemand: 0, maxTPsNeeded: 0, maxSourcersNeeded: 0, maxCoordinatorsNeeded: 0,
      capacityGapPercent: 0, weeklyData: [], maxCapacity: 0, limitingFactor: 'Balanced', 
      currentTPs: 0, currentSourcers: 0, totalPools: 0
    };
  }

  const { hiringDuration, rampUpWeeks, poolsPerSourcer } = config;
  const totalWeeks = hiringDuration + rampUpWeeks;

  const totalCurrentTPs = scenarios.reduce((sum, s) => sum + (s.currentTalentPartners || 0), 0);
  const totalTpCapacity = totalCurrentTPs * config.tpCapacityPerWeek;
  
  // Aggregate total demand target
  const totalAggregateHires = scenarios.reduce((sum, s) => sum + s.demand.reduce((a, b) => a + b, 0), 0);
  const aggHiresPerWeek = totalAggregateHires / hiringDuration;

  const weeklyData: WeeklyResult[] = [];
  
  for (let i = 0; i < totalWeeks; i++) {
    const isRampUp = i < rampUpWeeks;
    const weekDemand = isRampUp ? 0 : aggHiresPerWeek;
    
    // Calculate how many pools are "active" this week
    const activePoolCount = scenarios.filter(s => {
        // A pool is active if it has demand in the current week (mapped to hiring duration)
        if (isRampUp) return true; // Assume all pools ramp up together
        return s.demand.reduce((a, b) => a + b, 0) > 0;
    }).length;

    const rawTPsNeeded = aggHiresPerWeek / config.tpCapacityPerWeek;
    const tpsNeeded = Math.ceil(rawTPsNeeded);
    
    // Sourcing headcount = Active Pools / Ratio
    const sourcersNeeded = Math.ceil(activePoolCount / poolsPerSourcer);

    weeklyData.push({
      week: i + 1,
      isRampUp,
      demand: weekDemand,
      sourcersNeeded: sourcersNeeded,
      tpsNeeded: tpsNeeded,
      coordinatorsNeeded: Math.ceil(tpsNeeded / 4),
      capacity: totalTpCapacity,
      gap: weekDemand > 0 ? Math.max(0, (weekDemand - totalTpCapacity) / weekDemand) : 0
    });
  }

  const totalDemand = weeklyData.reduce((sum, w) => sum + w.demand, 0);
  const peakWeeklyDemand = Math.max(...weeklyData.map(d => d.demand), 0);
  const maxTPsNeeded = Math.max(...weeklyData.map(d => d.tpsNeeded), 0);
  const maxSourcersNeeded = Math.max(...weeklyData.map(d => d.sourcersNeeded), 0);
  const maxCoordinatorsNeeded = Math.max(...weeklyData.map(d => d.coordinatorsNeeded), 0);
  const capacityGapPercent = totalDemand > 0 
    ? Math.max(0, ((totalDemand - (totalTpCapacity * hiringDuration)) / totalDemand) * 100)
    : 0;

  return {
    totalDemand,
    peakWeeklyDemand,
    maxTPsNeeded,
    maxSourcersNeeded,
    maxCoordinatorsNeeded,
    capacityGapPercent,
    weeklyData,
    maxCapacity: totalTpCapacity,
    limitingFactor: 'Talent Partners',
    currentTPs: totalCurrentTPs,
    currentSourcers: config.totalSourcers,
    totalPools: scenarios.length
  };
};

export const generateCurve = (type: 'flat' | 'linear', weeks: number, totalHires: number): number[] => {
  if (weeks <= 0) return [];
  if (type === 'flat') {
    return new Array(weeks).fill(totalHires / weeks);
  }
  const curve = new Array(weeks).fill(0);
  const slope = (2 * totalHires) / (weeks * (weeks + 1));
  let sum = 0;
  const vals = curve.map((_, i) => {
    const v = slope * (i + 1);
    sum += v;
    return v;
  });
  const factor = totalHires / sum;
  return vals.map(v => v * factor);
};
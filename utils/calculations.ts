import { GlobalConfig, Scenario, SimulationResult, WeeklyResult } from '../types';

export const calculateScenarioMetrics = (
  scenario: Scenario,
  config: GlobalConfig
): SimulationResult => {
  const { hiringDuration, rampUpWeeks } = config;
  const totalWeeks = hiringDuration + rampUpWeeks;

  // Preserve the intended total volume: sum the original demand array
  const totalHiresTarget = scenario.demand.reduce((a, b) => a + b, 0);
  
  // Redistribute that volume across the CURRENT hiring duration
  // This ensures that if duration shrinks, weekly intensity increases to keep demand constant.
  const hiresPerWeek = totalHiresTarget > 0 ? totalHiresTarget / hiringDuration : 0;
  const hiringDemand = new Array(hiringDuration).fill(hiresPerWeek);

  // Demand for resource calculation during ramp-up (look ahead to the first hiring week)
  const rampResourceDemand = hiringDemand[0] || 0;

  const tpMaxHires = (scenario.currentTalentPartners || 0) * config.tpCapacityPerWeek;
  const sourcerMaxHires = (config.totalSourcers * config.sourcerCapacityPerWeek) / config.candidatesPerHireBenchmark;
  const actualCapacity = Math.min(tpMaxHires, sourcerMaxHires);
  const limitingFactor = tpMaxHires < sourcerMaxHires ? 'Talent Partners' : (sourcerMaxHires < tpMaxHires ? 'Sourcers' : 'Balanced');

  const weeklyData: WeeklyResult[] = [];

  // Build the full timeline: Ramp Up Weeks + Hiring Weeks
  for (let i = 0; i < totalWeeks; i++) {
    const isRampUp = i < rampUpWeeks;
    const demand = isRampUp ? 0 : hiringDemand[i - rampUpWeeks];
    
    // During ramp-up, resources are needed based on the upcoming hiring volume
    const resourceBasis = isRampUp ? rampResourceDemand : demand;

    const rawSourcersNeeded = (resourceBasis * config.candidatesPerHireBenchmark) / config.sourcerCapacityPerWeek;
    const rawTPsNeeded = resourceBasis / config.tpCapacityPerWeek;
    const tpsNeeded = Math.ceil(rawTPsNeeded);

    weeklyData.push({
      week: i + 1,
      isRampUp,
      demand,
      sourcersNeeded: Math.ceil(rawSourcersNeeded),
      tpsNeeded: tpsNeeded,
      coordinatorsNeeded: Math.ceil(tpsNeeded / 4),
      capacity: actualCapacity,
      gap: demand > 0 ? Math.max(0, (demand - actualCapacity) / demand) : 0,
    });
  }

  const totalDemand = hiringDemand.reduce((a, b) => a + b, 0);
  const peakWeeklyDemand = Math.max(...hiringDemand, 0);
  const maxTPsNeeded = Math.max(...weeklyData.map(d => d.tpsNeeded), 0);
  const maxSourcersNeeded = Math.max(...weeklyData.map(d => d.sourcersNeeded), 0);
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
  };
};

export const aggregateResults = (results: SimulationResult[], scenarios: Scenario[], config: GlobalConfig): SimulationResult => {
  if (results.length === 0) {
    return {
      totalDemand: 0, peakWeeklyDemand: 0, maxTPsNeeded: 0, maxSourcersNeeded: 0, maxCoordinatorsNeeded: 0,
      capacityGapPercent: 0, weeklyData: [], maxCapacity: 0, limitingFactor: 'Balanced', 
      currentTPs: 0, currentSourcers: 0 
    };
  }

  const { hiringDuration, rampUpWeeks } = config;
  const totalWeeks = hiringDuration + rampUpWeeks;

  const totalCurrentTPs = scenarios.reduce((sum, s) => sum + (s.currentTalentPartners || 0), 0);
  const totalTpCapacity = totalCurrentTPs * config.tpCapacityPerWeek;
  const totalSourcerCapacity = (config.totalSourcers * config.sourcerCapacityPerWeek) / config.candidatesPerHireBenchmark;
  const sharedWeeklyCapacity = Math.min(totalTpCapacity, totalSourcerCapacity);

  // Aggregate total demand target from all scenarios
  const totalAggregateHires = scenarios.reduce((sum, s) => sum + s.demand.reduce((a, b) => a + b, 0), 0);
  const aggHiresPerWeek = totalAggregateHires / hiringDuration;

  const weeklyData: WeeklyResult[] = [];
  
  for (let i = 0; i < totalWeeks; i++) {
    const isRampUp = i < rampUpWeeks;
    const weekDemand = isRampUp ? 0 : aggHiresPerWeek;
    const resourceBasis = aggHiresPerWeek; // Constant basis for aggregate

    const rawSourcersNeeded = (resourceBasis * config.candidatesPerHireBenchmark) / config.sourcerCapacityPerWeek;
    const rawTPsNeeded = resourceBasis / config.tpCapacityPerWeek;
    const tpsNeeded = Math.ceil(rawTPsNeeded);

    weeklyData.push({
      week: i + 1,
      isRampUp,
      demand: weekDemand,
      sourcersNeeded: Math.ceil(rawSourcersNeeded),
      tpsNeeded: tpsNeeded,
      coordinatorsNeeded: Math.ceil(tpsNeeded / 4),
      capacity: sharedWeeklyCapacity,
      gap: weekDemand > 0 ? Math.max(0, (weekDemand - sharedWeeklyCapacity) / weekDemand) : 0
    });
  }

  const totalDemand = weeklyData.reduce((sum, w) => sum + w.demand, 0);
  const peakWeeklyDemand = Math.max(...weeklyData.map(d => d.demand), 0);
  const maxTPsNeeded = Math.max(...weeklyData.map(d => d.tpsNeeded), 0);
  const maxSourcersNeeded = Math.max(...weeklyData.map(d => d.sourcersNeeded), 0);
  const maxCoordinatorsNeeded = Math.max(...weeklyData.map(d => d.coordinatorsNeeded), 0);
  const capacityGapPercent = totalDemand > 0 
    ? Math.max(0, ((totalDemand - (sharedWeeklyCapacity * hiringDuration)) / totalDemand) * 100)
    : 0;

  return {
    totalDemand,
    peakWeeklyDemand,
    maxTPsNeeded,
    maxSourcersNeeded,
    maxCoordinatorsNeeded,
    capacityGapPercent,
    weeklyData,
    maxCapacity: sharedWeeklyCapacity,
    limitingFactor: totalTpCapacity < totalSourcerCapacity ? 'Talent Partners' : 'Sourcers',
    currentTPs: totalCurrentTPs,
    currentSourcers: config.totalSourcers
  };
};

export const generateCurve = (type: 'flat' | 'linear', weeks: number, totalHires: number): number[] => {
  if (weeks <= 0) return [];
  if (type === 'flat') {
    return new Array(weeks).fill(totalHires / weeks);
  }
  // Simplified linear curve
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
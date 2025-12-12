import { GlobalConfig, Scenario, SimulationResult, WeeklyResult } from '../types';

export const calculateScenarioMetrics = (
  scenario: Scenario,
  config: GlobalConfig
): SimulationResult => {
  // Ensure we have exactly weeksToSimulate data points
  let activeWeeks = scenario.demand.slice(0, config.weeksToSimulate);
  if (activeWeeks.length < config.weeksToSimulate) {
      activeWeeks = [...activeWeeks, ...Array(config.weeksToSimulate - activeWeeks.length).fill(0)];
  }
  
  // Capacity Calculation (Scenario View)
  const tpMaxHires = (scenario.currentTalentPartners || 0) * config.tpCapacityPerWeek;
  
  // For individual scenario view, we assume full global sourcer pool is available 
  const sourcerMaxHires = (config.totalSourcers * config.sourcerCapacityPerWeek) / config.candidatesPerHireBenchmark;
  
  const actualCapacity = Math.min(tpMaxHires, sourcerMaxHires);
  const limitingFactor = tpMaxHires < sourcerMaxHires ? 'Talent Partners' : (sourcerMaxHires < tpMaxHires ? 'Sourcers' : 'Balanced');

  const weeklyData: WeeklyResult[] = activeWeeks.map((hires, index) => {
    const rawSourcersNeeded = (hires * config.candidatesPerHireBenchmark) / config.sourcerCapacityPerWeek;
    const rawTPsNeeded = hires / config.tpCapacityPerWeek;

    const sourcersNeeded = Math.ceil(rawSourcersNeeded);
    const tpsNeeded = Math.ceil(rawTPsNeeded);

    let gap = 0;
    if (hires > 0) {
      gap = Math.max(0, (hires - actualCapacity) / hires);
    }

    return {
      week: index + 1,
      demand: hires,
      sourcersNeeded,
      tpsNeeded,
      capacity: actualCapacity,
      gap: gap,
    };
  });

  // Calculate totalDemand from the active weeks directly
  const totalDemand = activeWeeks.reduce((a, b) => a + b, 0);
  const peakWeeklyDemand = Math.max(...activeWeeks, 0);
  const maxTPsNeeded = Math.max(...weeklyData.map(d => d.tpsNeeded), 0);
  const maxSourcersNeeded = Math.max(...weeklyData.map(d => d.sourcersNeeded), 0);
  
  const totalCapacityOverPeriod = weeklyData.reduce((sum, w) => sum + w.capacity, 0);
  const capacityGapPercent = totalDemand > 0 
    ? Math.max(0, ((totalDemand - totalCapacityOverPeriod) / totalDemand) * 100)
    : 0;

  return {
    totalDemand,
    peakWeeklyDemand,
    maxTPsNeeded,
    maxSourcersNeeded,
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
          totalDemand: 0,
          peakWeeklyDemand: 0,
          maxTPsNeeded: 0,
          maxSourcersNeeded: 0,
          capacityGapPercent: 0,
          weeklyData: [],
          maxCapacity: 0,
          limitingFactor: 'Balanced',
          currentTPs: 0,
          currentSourcers: 0
      }
  }

  // Calculate Global Shared Capacity from all scenarios
  const totalCurrentTPs = scenarios.reduce((sum, s) => sum + (s.currentTalentPartners || 0), 0);
  const totalCurrentSourcers = config.totalSourcers; 
  
  const totalTpCapacity = totalCurrentTPs * config.tpCapacityPerWeek;
  const totalSourcerCapacity = (totalCurrentSourcers * config.sourcerCapacityPerWeek) / config.candidatesPerHireBenchmark;
  
  const sharedWeeklyCapacity = Math.min(totalTpCapacity, totalSourcerCapacity);
  const limitingFactor = totalTpCapacity < totalSourcerCapacity ? 'Talent Partners' : (totalSourcerCapacity < totalTpCapacity ? 'Sourcers' : 'Balanced');

  // Use config.weeksToSimulate to ensure we loop through the correct timeframe
  const numWeeks = config.weeksToSimulate;
  const weeklyData: WeeklyResult[] = [];

  for (let i = 0; i < numWeeks; i++) {
    // Robust Summing: Iterate through all results and safely add demand for week i
    const weekDemand = results.reduce((sum, r) => {
        // Use optional chaining and default to 0 to handle potential undefined if arrays are mismatched
        const val = r.weeklyData[i]?.demand;
        return sum + (typeof val === 'number' ? val : 0);
    }, 0);
    
    // RECALCULATE needed resources based on TOTAL demand (Shared Pool Logic)
    const rawSourcersNeeded = (weekDemand * config.candidatesPerHireBenchmark) / config.sourcerCapacityPerWeek;
    const rawTPsNeeded = weekDemand / config.tpCapacityPerWeek;
    
    const weekSourcers = Math.ceil(rawSourcersNeeded);
    const weekTPs = Math.ceil(rawTPsNeeded);
    
    const weekCapacity = sharedWeeklyCapacity;

    let gap = 0;
    if (weekDemand > 0) {
        gap = Math.max(0, (weekDemand - weekCapacity) / weekDemand);
    }

    weeklyData.push({
      week: i + 1,
      demand: weekDemand,
      sourcersNeeded: weekSourcers,
      tpsNeeded: weekTPs,
      capacity: weekCapacity,
      gap: gap 
    });
  }

  // Calculate Aggregates from the newly constructed weeklyData to ensure consistency
  const totalDemand = weeklyData.reduce((sum, w) => sum + w.demand, 0);
  const peakWeeklyDemand = Math.max(...weeklyData.map(d => d.demand), 0);
  const maxTPsNeeded = Math.max(...weeklyData.map(d => d.tpsNeeded), 0);
  const maxSourcersNeeded = Math.max(...weeklyData.map(d => d.sourcersNeeded), 0);
  
  const totalCapacityOverPeriod = weeklyData.reduce((sum, w) => sum + w.capacity, 0);
  const capacityGapPercent = totalDemand > 0 
    ? Math.max(0, ((totalDemand - totalCapacityOverPeriod) / totalDemand) * 100)
    : 0;

  return {
    totalDemand,
    peakWeeklyDemand,
    maxTPsNeeded,
    maxSourcersNeeded,
    capacityGapPercent,
    weeklyData,
    maxCapacity: sharedWeeklyCapacity,
    limitingFactor,
    currentTPs: totalCurrentTPs,
    currentSourcers: totalCurrentSourcers
  };
};

export const generateCurve = (type: 'flat' | 'linear' | 'seasonal' | 'front-loaded', weeks: number, totalHires: number): number[] => {
  let curve = new Array(weeks).fill(0);
  
  if (type === 'flat') {
    const perWeek = totalHires / weeks; 
    return curve.map(() => perWeek);
  }
  
  if (type === 'linear') {
    const slope = (2 * totalHires) / (weeks * weeks);
    let currentSum = 0;
    curve = curve.map((_, i) => {
        const val = slope * (i + 1);
        currentSum += val;
        return val;
    });
    const factor = totalHires / currentSum;
    return curve.map(v => v * factor);
  } 
  
  return curve.map(() => totalHires / weeks);
};
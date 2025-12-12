export interface Scenario {
  id: string;
  name: string; // e.g., "Engineering", "Sales"
  demand: number[]; // Array of 52 numbers (hires per week)
  color: string;
  currentTalentPartners: number; // For gap analysis
}

export interface GlobalConfig {
  weeksToSimulate: number;
  tpCapacityPerWeek: number; // Hires per week per TP
  sourcerCapacityPerWeek: number; // Candidates generated per week per Sourcer
  candidatesPerHireBenchmark: number; // Default 4
  totalSourcers: number; // Global pool of sourcers
}

export interface WeeklyResult {
  week: number;
  demand: number;
  sourcersNeeded: number;
  tpsNeeded: number;
  capacity: number; // Capacity in hires/week for this pool/week
  gap: number; // Negative means shortage
}

export interface SimulationResult {
  totalDemand: number;
  peakWeeklyDemand: number;
  maxTPsNeeded: number;
  maxSourcersNeeded: number;
  capacityGapPercent: number;
  weeklyData: WeeklyResult[];
  currentTPs: number;
  currentSourcers: number;
  maxCapacity: number;
  limitingFactor: string;
}
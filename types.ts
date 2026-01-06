export interface Scenario {
  id: string;
  name: string; // e.g., "Engineering", "Sales"
  demand: number[]; // Array of numbers representing hires per week during the hiring period
  color: string;
  currentTalentPartners: number; // For gap analysis
}

export interface GlobalConfig {
  hiringDuration: number; // Number of weeks where hiring happens
  rampUpWeeks: number; // Lead time before hires start
  tpCapacityPerWeek: number; // Hires per week per TP
  sourcerCapacityPerWeek: number; // Candidates generated per week per Sourcer
  candidatesPerHireBenchmark: number; // Default 10
  totalSourcers: number; // Global pool of sourcers
}

export interface WeeklyResult {
  week: number;
  isRampUp: boolean;
  demand: number;
  sourcersNeeded: number;
  tpsNeeded: number;
  coordinatorsNeeded: number;
  capacity: number;
  gap: number;
}

export interface SimulationResult {
  totalDemand: number;
  peakWeeklyDemand: number;
  maxTPsNeeded: number;
  maxSourcersNeeded: number;
  maxCoordinatorsNeeded: number;
  capacityGapPercent: number;
  weeklyData: WeeklyResult[];
  currentTPs: number;
  currentSourcers: number;
  maxCapacity: number;
  limitingFactor: string;
}
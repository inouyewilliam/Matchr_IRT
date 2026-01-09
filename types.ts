export interface Scenario {
  id: string;
  name: string; // e.g., "Engineering", "Sales"
  demand: number[]; // Array of numbers representing hires per week during the hiring period
  color: string;
  currentTalentPartners: number; // For gap analysis
  isManualTP?: boolean; // tracks if user manually set the TP count
}

export interface GlobalConfig {
  hiringDuration: number; // Number of weeks where hiring happens
  rampUpWeeks: number; // Lead time before hires start
  tpCapacityPerWeek: number; // Hires per week per TP
  poolsPerSourcer: number; // New: Number of concurrent talent pools a sourcer can handle (1-15)
  totalSourcers: number; // Global pool of sourcers
  isManualSourcers?: boolean; // tracks if user manually set the sourcer count
  candidatesPerHireBenchmark?: number; // Kept as optional for backward compatibility if needed, but unused in new logic
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
  totalPools: number; // New: tracking count of pools
}
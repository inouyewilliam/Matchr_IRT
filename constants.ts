import { GlobalConfig, Scenario } from './types';

export const DEFAULT_CONFIG: GlobalConfig = {
  hiringDuration: 16,
  rampUpWeeks: 4,
  tpCapacityPerWeek: 1,
  poolsPerSourcer: 5, // Baseline: 5 concurrent pools per sourcer
  totalSourcers: 1,
  isManualSourcers: false,
};

export const INITIAL_SCENARIOS: Scenario[] = [
  {
    id: '1',
    name: 'Engineering',
    demand: Array(16).fill(1), // 16 weeks of hiring
    color: '#5B28B9',
    currentTalentPartners: 1,
  },
  {
    id: '2',
    name: 'Sales',
    demand: Array(16).fill(2), // 16 weeks of hiring
    color: '#F4B942',
    currentTalentPartners: 1,
  },
];

export const COLORS = [
  '#5B28B9',
  '#F4B942',
  '#241049',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
];
import { GlobalConfig, Scenario } from './types';

export const DEFAULT_CONFIG: GlobalConfig = {
  weeksToSimulate: 12, // Updated to 12 weeks default
  tpCapacityPerWeek: 1,
  sourcerCapacityPerWeek: 10, // qualified candidates per week
  candidatesPerHireBenchmark: 10,
  totalSourcers: 2,
};

export const INITIAL_SCENARIOS: Scenario[] = [
  {
    id: '1',
    name: 'Engineering',
    demand: Array(0).fill(1), // Default 1 hire/week
    color: '#5B28B9', // Brand Primary
    currentTalentPartners: 1,
  },
  {
    id: '2',
    name: 'Sales',
    demand: Array(0).fill(0).map((_, i) => (i > 4 ? 2 : 0)), // Ramping
    color: '#F4B942', // Brand Accent
    currentTalentPartners: 1,
  },
];

export const COLORS = [
  '#5B28B9', // Brand Primary
  '#F4B942', // Brand Accent
  '#241049', // Brand Dark
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald (Legacy)
];
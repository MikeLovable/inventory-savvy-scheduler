
import { Algorithm } from './Algorithm';
import { AlgorithmFlat20 } from './AlgorithmFlat20';
import { AlgorithmNaiveReplenish } from './AlgorithmNaiveReplenish';
import { AlgorithmSmartReplenish } from './AlgorithmSmartReplenish';
import { AlgorithmAIDesigned } from './AlgorithmAIDesigned';
import { AlgorithmLookAheadLdTm } from './AlgorithmLookAheadLdTm';

// Create instances of each algorithm
export const algorithms: Record<string, Algorithm> = {
  Flat20: new AlgorithmFlat20(),
  NaiveReplenish: new AlgorithmNaiveReplenish(),
  SmartReplenish: new AlgorithmSmartReplenish(),
  AIDesigned: new AlgorithmAIDesigned(),
  LookAheadLdTm: new AlgorithmLookAheadLdTm()
};

// Get all available algorithms
export function getAlgorithms(): Algorithm[] {
  return Object.values(algorithms);
}

// Get an algorithm by name
export function getAlgorithmByName(name: string): Algorithm {
  const algorithm = algorithms[name];
  if (!algorithm) {
    throw new Error(`Unknown algorithm: ${name}`);
  }
  return algorithm;
}

// Get order schedules using a specified algorithm
export function GetOrders(productionScenarios: any[], algorithmName: string) {
  const algorithm = getAlgorithmByName(algorithmName);
  return algorithm.calculateOrderScheduleArray(productionScenarios);
}

import { 
  DataSource, 
  ProductionScenario, 
  ProductionScenarioArray, 
  PERIODS, 
  SAMPLES,
  getRandomInt,
  generateRandomRequirements,
  generateRandomReceiving
} from './types';

// Static instances of DataSource
const dataSourceStaticRandom: DataSource = {
  Name: "StaticRandom",
  Desc: "Scenario1",
  ProductionScenarioArray: []
};

const dataSourceCustomer: DataSource = {
  Name: "Customer",
  Desc: "Scenario2",
  ProductionScenarioArray: []
};

const dataSourceScenario3: DataSource = {
  Name: "Scenario3",
  Desc: "Scenario3",
  ProductionScenarioArray: []
};

const dataSourceRandom: DataSource = {
  Name: "Random",
  Desc: "Random",
  ProductionScenarioArray: []
};

// Array of all data sources
const dataSources: DataSource[] = [
  dataSourceStaticRandom,
  dataSourceCustomer,
  dataSourceScenario3,
  dataSourceRandom
];

/**
 * Generate a single random production scenario
 */
function generateRandomProductionScenario(index: number): ProductionScenario {
  // Generate LdTm, MOQ, PkQty, InvTgt, SStok according to rules
  const ldTm = getRandomInt(1, 5);
  const invTgt = getRandomInt(1, 20) * 10; // Multiple of 10
  const sstok = Math.floor(invTgt * 0.2 * Math.random()); // Less than 20% of InvTgt
  const moq = getRandomInt(1, 10) * 10; // Multiple of 10
  const pkQty = getRandomInt(1, Math.floor(moq / 5)) * 5; // Multiple of 5, less than MOQ

  // Generate arrays for requirements and receiving
  const rqt = generateRandomRequirements(PERIODS + 1);
  const rec = generateRandomReceiving(PERIODS + 1);
  
  // Initialize inventory array
  const inv = new Array(PERIODS + 1).fill(-1); // -1 represents N/A
  inv[0] = getRandomInt(invTgt - 10, invTgt + 10); // Starting inventory
  
  return {
    Sel: true, // Selected by default
    MPN: `MPN_${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + (index % 26))}`,
    Inv: inv,
    InvTgt: invTgt,
    SStok: sstok,
    LdTm: ldTm,
    MOQ: moq,
    PkQty: pkQty,
    Rqt: rqt,
    Rec: rec
  };
}

/**
 * Generate an array of random production scenarios
 */
function generateRandomProductionScenarioArray(): ProductionScenarioArray {
  const scenarios: ProductionScenarioArray = [];
  
  // Use SAMPLES for the number of scenarios
  for (let i = 0; i < SAMPLES; i++) {
    scenarios.push(generateRandomProductionScenario(i));
  }
  
  return scenarios;
}

// Initialize static data sources with random data
dataSourceStaticRandom.ProductionScenarioArray = generateRandomProductionScenarioArray();
dataSourceCustomer.ProductionScenarioArray = generateRandomProductionScenarioArray();
dataSourceScenario3.ProductionScenarioArray = generateRandomProductionScenarioArray();

/**
 * Get a data source by name
 */
export function getDataSourceByName(name: string): DataSource {
  const dataSource = dataSources.find((ds) => ds.Name === name);
  
  if (!dataSource) {
    throw new Error(`DataSource not found: ${name}`);
  }
  
  return dataSource;
}

/**
 * Get production scenarios from a data source
 */
export function GetProductionScenarios(dataSourceName: string = "Random"): ProductionScenarioArray {
  console.log(`Getting production scenarios for data source: ${dataSourceName}`);
  
  if (dataSourceName === "Random") {
    // For Random, always generate new random data
    dataSourceRandom.ProductionScenarioArray = generateRandomProductionScenarioArray();
    return dataSourceRandom.ProductionScenarioArray;
  }
  
  // Otherwise, get the data from the existing data source
  const dataSource = getDataSourceByName(dataSourceName);
  
  // If it's the first time accessing this data source or if PERIODS or SAMPLES have changed,
  // we might need to regenerate the data
  if (
    dataSource.ProductionScenarioArray.length === 0 || 
    dataSource.ProductionScenarioArray.length !== SAMPLES ||
    dataSource.ProductionScenarioArray[0].Rqt.length !== PERIODS + 1
  ) {
    dataSource.ProductionScenarioArray = generateRandomProductionScenarioArray();
  }
  
  return dataSource.ProductionScenarioArray;
}

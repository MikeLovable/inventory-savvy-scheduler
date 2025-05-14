
import { 
  DataSource, 
  ProductionScenario, 
  ProductionScenarioArray, 
  PERIODS,
  SAMPLES 
} from './types';

/**
 * Generate a random integer between min and max, inclusive
 */
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate an MPN string in the format MPN_XXX
 */
function generateMPN(index: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = 'MPN_';
  
  // Convert index to alphabetic representation
  if (index < 26) {
    result += letters[index % 26] + letters[index % 26] + letters[index % 26];
  } else {
    result += letters[Math.floor(index / 26) - 1] + letters[index % 26] + letters[(index * 7) % 26];
  }
  
  return result;
}

/**
 * Generate a random production scenario
 */
export function generateRandomProductionScenario(index: number): ProductionScenario {
  // Generate random values that comply with the specified rules
  const invTgt = getRandomInt(1, 20) * 10;  // Multiple of 10 between 10-200
  const sstok = getRandomInt(1, Math.floor(invTgt * 0.05));  // Less than 5% of invTgt
  const ldTm = getRandomInt(1, 5);  // Whole integer between 1-5
  const moq = getRandomInt(1, 10) * 10;  // Multiple of 10 between 10-100
  const pkQty = getRandomInt(1, Math.floor(moq / 5)) * 5;  // Multiple of 5 less than MOQ

  // Generate requirements, random values between 0-400
  const rqt = Array.from({ length: PERIODS + 1 }, () => getRandomInt(0, 400));
  
  // Generate receiving, random values between 0-400
  const rec = Array.from({ length: PERIODS + 1 }, () => getRandomInt(0, 400));
  
  // Generate starting inventory
  const startingInv = getRandomInt(invTgt - sstok, invTgt + sstok);
  
  // Create the inventory array with N/A represented as -1 for positions 1 onwards
  const inv = new Array(PERIODS + 1).fill(-1);
  inv[0] = startingInv;  // Set starting inventory

  return {
    Sel: true,
    MPN: generateMPN(index),
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
 * Generate a random production scenario array
 */
export function generateRandomProductionScenarioArray(): ProductionScenarioArray {
  const count = Math.min(SAMPLES, 30);  // Use SAMPLES but cap at 30
  const scenarios: ProductionScenarioArray = [];
  
  for (let i = 0; i < count; i++) {
    scenarios.push(generateRandomProductionScenario(i));
  }
  
  return scenarios;
}

// Define hardcoded data sources
export const StaticRandomDataSource: DataSource = {
  Name: "StaticRandom",
  Desc: "Scenario1",
  ProductionScenarioArray: [
    {
      Sel: true,
      MPN: "MPN_AAA",
      Inv: [120, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      InvTgt: 100,
      SStok: 5,
      LdTm: 2,
      MOQ: 50,
      PkQty: 10,
      Rqt: [50, 70, 90, 40, 60, 80, 100, 50, 70, 90, 40, 60, 80],
      Rec: [0, 0, 50, 100, 50, 0, 50, 100, 0, 0, 50, 100, 0]
    },
    {
      Sel: true,
      MPN: "MPN_BBB",
      Inv: [80, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      InvTgt: 150,
      SStok: 7,
      LdTm: 3,
      MOQ: 70,
      PkQty: 5,
      Rqt: [30, 40, 50, 60, 70, 80, 90, 100, 90, 80, 70, 60, 50],
      Rec: [50, 0, 0, 70, 0, 0, 70, 0, 0, 70, 0, 0, 70]
    },
    {
      Sel: true,
      MPN: "MPN_CCC",
      Inv: [200, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      InvTgt: 160,
      SStok: 8,
      LdTm: 4,
      MOQ: 40,
      PkQty: 10,
      Rqt: [100, 80, 60, 40, 100, 80, 60, 40, 100, 80, 60, 40, 100],
      Rec: [0, 40, 0, 40, 0, 40, 0, 40, 0, 40, 0, 40, 0]
    }
  ]
};

export const CustomerDataSource: DataSource = {
  Name: "Customer",
  Desc: "Scenario2",
  ProductionScenarioArray: [
    {
      Sel: true,
      MPN: "MPN_DEF",
      Inv: [90, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      InvTgt: 80,
      SStok: 4,
      LdTm: 1,
      MOQ: 20,
      PkQty: 5,
      Rqt: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
      Rec: [20, 20, 20, 20, 40, 40, 40, 60, 60, 60, 80, 80, 80]
    },
    {
      Sel: true,
      MPN: "MPN_GHI",
      Inv: [150, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      InvTgt: 120,
      SStok: 6,
      LdTm: 2,
      MOQ: 30,
      PkQty: 5,
      Rqt: [40, 40, 40, 60, 60, 60, 80, 80, 80, 100, 100, 100, 80],
      Rec: [0, 30, 30, 30, 60, 60, 60, 90, 90, 90, 120, 120, 90]
    }
  ]
};

export const Scenario3DataSource: DataSource = {
  Name: "Scenario3",
  Desc: "Scenario3",
  ProductionScenarioArray: [
    {
      Sel: true,
      MPN: "MPN_JKL",
      Inv: [50, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      InvTgt: 60,
      SStok: 3,
      LdTm: 3,
      MOQ: 40,
      PkQty: 10,
      Rqt: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
      Rec: [40, 0, 0, 40, 0, 0, 40, 0, 0, 40, 0, 0, 40]
    },
    {
      Sel: true,
      MPN: "MPN_MNO",
      Inv: [120, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      InvTgt: 100,
      SStok: 5,
      LdTm: 4,
      MOQ: 60,
      PkQty: 15,
      Rqt: [30, 30, 30, 30, 50, 50, 50, 50, 70, 70, 70, 70, 60],
      Rec: [0, 0, 0, 60, 0, 0, 0, 60, 0, 0, 0, 60, 0]
    },
    {
      Sel: true,
      MPN: "MPN_PQR",
      Inv: [200, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
      InvTgt: 180,
      SStok: 9,
      LdTm: 5,
      MOQ: 90,
      PkQty: 15,
      Rqt: [50, 60, 70, 80, 90, 100, 90, 80, 70, 60, 50, 40, 30],
      Rec: [90, 0, 0, 0, 0, 90, 0, 0, 0, 0, 90, 0, 0]
    }
  ]
};

export const RandomDataSource: DataSource = {
  Name: "Random",
  Desc: "Random",
  ProductionScenarioArray: generateRandomProductionScenarioArray()
};

// Function to get data sources by name
export function getDataSourceByName(name: string): DataSource {
  switch (name) {
    case "StaticRandom":
      return StaticRandomDataSource;
    case "Customer":
      return CustomerDataSource;
    case "Scenario3":
      return Scenario3DataSource;
    case "Random":
    default:
      // Return a new random dataset each time
      return {
        Name: "Random",
        Desc: "Random",
        ProductionScenarioArray: generateRandomProductionScenarioArray()
      };
  }
}

/**
 * Get production scenarios from a data source
 */
export function GetProductionScenarios(dataSourceName?: string): ProductionScenarioArray {
  try {
    if (!dataSourceName || dataSourceName === "Random") {
      return generateRandomProductionScenarioArray();
    }
    
    const dataSource = getDataSourceByName(dataSourceName);
    if (!dataSource) {
      throw new Error(`Unknown DataSource: ${dataSourceName}`);
    }
    
    return dataSource.ProductionScenarioArray;
  } catch (error) {
    console.error("Error getting production scenarios:", error);
    throw error;
  }
}

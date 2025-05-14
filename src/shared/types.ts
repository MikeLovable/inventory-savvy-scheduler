
// Global constants
export const DEFAULT_PERIODS = 12;
export const DEFAULT_SAMPLES = 10;
export const MIN_PERIODS = 1;
export const MAX_PERIODS = 20;
export const MIN_SAMPLES = 1;
export const MAX_SAMPLES = 30;

// Define basic types
export type Rqt = number[]; // Manufacturing requirements array
export type Rec = number[]; // Scheduled receiving array
export type Inv = number[]; // Inventory array
export type Ord = number[]; // Orders array

// ProductionScenario representing schedule of production requirements
export interface ProductionScenario {
  Sel: boolean;  // Whether scenario is selected
  MPN: string;   // Unique identifier for the part
  Inv: number[]; // Expected inventory quantities
  InvTgt: number; // Target inventory levels
  SStok: number; // Safety stock levels
  LdTm: number;  // Lead time in weeks
  MOQ: number;   // Minimum order quantity
  PkQty: number; // Package quantity
  Rqt: number[]; // Requirements array
  Rec: number[]; // Receiving array
}

// OrderSchedule representing recommended orders
export interface OrderSchedule {
  MPN: string;     // Part identifier
  InvTgt: number;  // Target inventory level
  SStok: number;   // Safety stock level
  LdTm: number;    // Lead time
  MOQ: number;     // Minimum order quantity
  PkQty: number;   // Package quantity
  Rqt: number[];   // Requirements array
  InRec: number[]; // Input receiving array
  Ord: number[];   // Recommended order quantities
  Rec: number[];   // Expected receiving
  Inv: number[];   // Expected inventory
  Notes: string;   // Notes about the schedule
}

export type ProductionScenarioArray = ProductionScenario[];
export type OrderScheduleArray = OrderSchedule[];

// DataSource class
export interface DataSource {
  Name: string;
  Desc: string;
  ProductionScenarioArray: ProductionScenarioArray;
}

// Define API request/response types
export interface GetProductionScenariosRequest {
  DataSource?: string;
}

export interface GetProductionScenariosResponse {
  productionScenarios: ProductionScenarioArray;
}

export interface GetOrdersRequest {
  productionScenarios: ProductionScenarioArray;
  algorithmName: string;
}

export interface GetOrdersResponse {
  orderSchedules: OrderScheduleArray;
}

export interface SimulateOrdersRequest {
  dataSource: string;
  algorithmName: string;
}

export interface SimulateOrdersResponse {
  orderSchedules: OrderScheduleArray;
}

// Global variables
export let PERIODS = DEFAULT_PERIODS;
export let SAMPLES = DEFAULT_SAMPLES;
export let SELECTEDDATASOURCE: DataSource | null = null;
export let SELECTEDALGORITHM: string = "SmartReplenish";

// Set global PERIODS value and ensure it's within bounds
export function setPERIODS(value: number): void {
  if (value < MIN_PERIODS) {
    PERIODS = MIN_PERIODS;
  } else if (value > MAX_PERIODS) {
    PERIODS = MAX_PERIODS;
  } else {
    PERIODS = value;
  }
  
  console.log(`PERIODS set to ${PERIODS}`);
}

// Set global SAMPLES value and ensure it's within bounds
export function setSAMPLES(value: number): void {
  if (value < MIN_SAMPLES) {
    SAMPLES = MIN_SAMPLES;
  } else if (value > MAX_SAMPLES) {
    SAMPLES = MAX_SAMPLES;
  } else {
    SAMPLES = value;
  }
  
  console.log(`SAMPLES set to ${SAMPLES}`);
}

import { OrderSchedule, ProductionScenario, ProductionScenarioArray, OrderScheduleArray, PERIODS } from './types';

/**
 * Abstract base class for all ordering algorithms
 */
export abstract class Algorithm {
  Name: string;
  Desc: string;

  constructor(name: string, desc: string) {
    this.Name = name;
    this.Desc = desc;
  }

  /**
   * Abstract method that must be implemented by subclasses
   * This is where the actual ordering logic is defined
   */
  protected abstract algorithm(orderSchedule: OrderSchedule): OrderSchedule;

  /**
   * Prepares an OrderSchedule from a ProductionScenario
   * Copies values from the ProductionScenario to create a skeleton OrderSchedule
   */
  public prepareOrderSchedule(productionScenario: ProductionScenario): OrderSchedule {
    // Create a new OrderSchedule with properties from ProductionScenario
    const orderSchedule: OrderSchedule = {
      MPN: productionScenario.MPN,
      InvTgt: productionScenario.InvTgt,
      SStok: productionScenario.SStok,
      LdTm: productionScenario.LdTm,
      MOQ: productionScenario.MOQ,
      PkQty: productionScenario.PkQty,
      Rqt: [...productionScenario.Rqt],
      InRec: [...productionScenario.Rec],  // Copy Rec from ProductionScenario to InRec
      Ord: new Array(productionScenario.Rqt.length).fill(0),  // Initialize Ord with zeros
      Rec: new Array(productionScenario.Rqt.length).fill(0),  // Initialize Rec with zeros
      Inv: [...productionScenario.Inv],    // Copy starting inventory
      Notes: ""
    };

    // Initialize the rest of Inv with N/A (represented as -1 since we're using number[])
    for (let i = 1; i < orderSchedule.Inv.length; i++) {
      if (orderSchedule.Inv[i] === undefined) {
        orderSchedule.Inv[i] = -1;  // Using -1 to represent N/A for inventory
      }
    }

    return orderSchedule;
  }

  /**
   * Calculates the impact of orders on inventory and receiving
   */
  public calculateOrderScheduleImpacts(orderSchedule: OrderSchedule): OrderSchedule {
    // Create a deep copy of the order schedule to avoid modifying the original
    const result: OrderSchedule = JSON.parse(JSON.stringify(orderSchedule));
    
    // a. Calculate future Rec values based on Orders and Lead Time
    for (let i = 0; i < result.Ord.length; i++) {
      const futureIndex = i + result.LdTm;
      
      // If the future index is within bounds, add to that position
      if (futureIndex < result.Rec.length) {
        result.Rec[futureIndex] += result.Ord[i];
      } else {
        // Otherwise, add to the last position
        result.Rec[result.Rec.length - 1] += result.Ord[i];
      }
    }
    
    // b. Calculate future Inv values
    // Start with the initial inventory value
    for (let i = 0; i < result.Inv.length; i++) {
      // For the first period, use the starting inventory
      if (i === 0) {
        result.Inv[i] = orderSchedule.Inv[0];
      } else {
        // For subsequent periods, calculate based on previous inventory
        const previousInv = result.Inv[i - 1];
        const tmp = result.Rqt[i] - result.Rec[i];
        result.Inv[i] = previousInv - tmp;
        
        // Ensure inventory never goes below zero
        if (result.Inv[i] < 0) {
          result.Inv[i] = 0;
        }
      }
    }
    
    // c. Populate Notes for any concerning conditions
    let notes: string[] = [];
    
    // Check if inventory ever reaches zero
    if (result.Inv.some(inv => inv === 0)) {
      notes.push("WARNING: Inventory will reach zero in some periods.");
    }
    
    // Check for inventory > 3x target for 2+ consecutive weeks
    let highInventoryConsecutiveWeeks = 0;
    for (let i = 0; i < result.Inv.length; i++) {
      if (result.Inv[i] > 3 * result.InvTgt) {
        highInventoryConsecutiveWeeks++;
        if (highInventoryConsecutiveWeeks >= 2) {
          notes.push("WARNING: Inventory exceeds 3x target for 2+ consecutive weeks.");
          break;
        }
      } else {
        highInventoryConsecutiveWeeks = 0;
      }
    }
    
    result.Notes = notes.join(" ");
    
    return result;
  }

  /**
   * Main function to calculate an OrderSchedule from a ProductionScenario
   */
  public calculateOrderSchedule(productionScenario: ProductionScenario): OrderSchedule {
    // Step 1: Prepare the initial OrderSchedule
    const initialOrderSchedule = this.prepareOrderSchedule(productionScenario);
    
    // Step 2: Apply the specific algorithm to determine Orders
    const scheduledOrderSchedule = this.algorithm(initialOrderSchedule);
    
    // Step 3: Calculate the impacts on inventory and receiving
    const finalOrderSchedule = this.calculateOrderScheduleImpacts(scheduledOrderSchedule);
    
    return finalOrderSchedule;
  }

  /**
   * Calculate an array of OrderSchedules from an array of ProductionScenarios
   */
  public calculateOrderScheduleArray(productionScenarios: ProductionScenarioArray): OrderScheduleArray {
    return productionScenarios
      .filter(scenario => scenario.Sel)  // Only process selected scenarios
      .map(scenario => this.calculateOrderSchedule(scenario));
  }
}


import { Algorithm } from './Algorithm';
import { OrderSchedule } from './types';

/**
 * AlgorithmAIDesigned - AI-designed algorithm optimizing for inventory management
 * Follows these priorities:
 * 1. Never allow inventory to fall below requirements
 * 2. Avoid having inventory > 3x target for 2+ consecutive weeks
 * 3. Keep inventory close to target + safety stock
 */
export class AlgorithmAIDesigned extends Algorithm {
  constructor() {
    super("AIDesigned", "Replenishment algorithm designed by AI after teaching it inventory concepts in English");
  }

  /**
   * Implementation of the algorithm method for AIDesigned
   * Uses a forward-looking approach to optimize inventory levels
   */
  protected algorithm(orderSchedule: OrderSchedule): OrderSchedule {
    // Create a copy to avoid modifying the input
    const result: OrderSchedule = { ...orderSchedule };
    
    // Set initial inventory level from the input
    let currentInventory = result.Inv[0];
    
    // For each period, calculate optimal order quantity
    for (let week = 0; week < result.Rqt.length; week++) {
      // Initialize projected inventory for future weeks
      const projectedInventory: number[] = new Array(result.Rqt.length).fill(0);
      projectedInventory[0] = currentInventory;
      
      // Look ahead and project inventory without new orders
      for (let i = 0; i < result.LdTm && week + i < result.Rqt.length; i++) {
        // Start with previous projected inventory
        projectedInventory[i + 1] = projectedInventory[i];
        
        // Add scheduled receipts
        if (week + i < result.InRec.length) {
          projectedInventory[i + 1] += result.InRec[week + i];
        }
        
        // Subtract requirements
        if (week + i < result.Rqt.length) {
          projectedInventory[i + 1] -= result.Rqt[week + i];
        }
      }
      
      // Calculate the projected inventory after lead time
      const leadTimeIndex = Math.min(week + result.LdTm, result.Rqt.length - 1);
      let projectedFutureInventory = projectedInventory[result.LdTm];
      
      // Determine how much to order based on our priorities
      let optimalOrderQty = 0;
      
      // Priority 1: Never allow inventory to fall below requirements
      const minNeededQty = Math.max(0, result.Rqt[leadTimeIndex] - projectedFutureInventory);
      
      // Priority 3: Aim for inventory close to target + safety stock
      const targetQty = result.InvTgt + result.SStok - projectedFutureInventory;
      
      // Combine priorities - first ensure we can fulfill requirements, then aim for target
      optimalOrderQty = Math.max(minNeededQty, targetQty);
      
      // Priority 2: Avoid having high inventory for consecutive weeks
      // Check if projected inventory would be too high
      if (projectedFutureInventory + optimalOrderQty > 3 * result.InvTgt) {
        // If we already have high inventory, reduce order but ensure we can fulfill requirements
        optimalOrderQty = Math.max(minNeededQty, result.InvTgt - projectedFutureInventory);
      }
      
      // Ensure order meets MOQ and is a multiple of PkQty
      if (optimalOrderQty > 0) {
        // Apply MOQ
        optimalOrderQty = Math.max(optimalOrderQty, result.MOQ);
        
        // Round up to nearest multiple of PkQty
        if (optimalOrderQty % result.PkQty !== 0) {
          optimalOrderQty = Math.ceil(optimalOrderQty / result.PkQty) * result.PkQty;
        }
      }
      
      // Set the order for this week
      result.Ord[week] = optimalOrderQty;
      
      // Update inventory for the next iteration
      currentInventory += result.InRec[week] - result.Rqt[week];
      if (week + result.LdTm < result.Rqt.length) {
        currentInventory += optimalOrderQty;
      }
      currentInventory = Math.max(0, currentInventory); // Ensure non-negative
    }
    
    return result;
  }
}

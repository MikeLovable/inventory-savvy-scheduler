
import { Algorithm } from './Algorithm';
import { OrderSchedule } from './types';

/**
 * AlgorithmSmartReplenish - Orders enough to cover current week's consumption
 * while also considering inventory target and safety stock
 */
export class AlgorithmSmartReplenish extends Algorithm {
  constructor() {
    super("SmartReplenish", "Reorders this weeks consumption but also considers InvTgt and SStok");
  }

  /**
   * Implementation of the algorithm method for SmartReplenish
   * Orders based on requirements and inventory targets
   */
  protected algorithm(orderSchedule: OrderSchedule): OrderSchedule {
    // Create a copy to avoid modifying the input directly
    const result: OrderSchedule = { ...orderSchedule };
    
    // For each period, calculate the order quantity
    result.Ord = result.Rqt.map(requirement => {
      // Calculate the order quantity based on requirements, MOQ, and PkQty
      let tmpOrderQty = Math.max(requirement, result.MOQ);
      
      // Round up to nearest multiple of PkQty
      if (tmpOrderQty % result.PkQty !== 0) {
        tmpOrderQty = Math.ceil(tmpOrderQty / result.PkQty) * result.PkQty;
      }
      
      // Check if order is enough to meet inventory target + safety stock
      const targetQty = result.InvTgt + result.SStok;
      
      // Return the higher of the two quantities
      return (tmpOrderQty >= targetQty) ? tmpOrderQty : targetQty;
    });
    
    return result;
  }
}

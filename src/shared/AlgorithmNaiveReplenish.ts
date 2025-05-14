
import { Algorithm } from './Algorithm';
import { OrderSchedule } from './types';

/**
 * AlgorithmNaiveReplenish - Orders enough to cover current week's consumption
 * Ensures orders meet MOQ and PkQty constraints
 */
export class AlgorithmNaiveReplenish extends Algorithm {
  constructor() {
    super("NaiveReplenish", "Reorders this weeks consumption, regardless of Rqt or Inv");
  }

  /**
   * Implementation of the algorithm method for NaiveReplenish
   * Orders enough to cover the current week's requirements
   */
  protected algorithm(orderSchedule: OrderSchedule): OrderSchedule {
    // Create a copy to avoid modifying the input directly
    const result: OrderSchedule = { ...orderSchedule };
    
    // For each period, order enough to cover the requirement
    // Ensure we meet MOQ and order in PkQty multiples
    result.Ord = result.Rqt.map(requirement => {
      // Find smallest integer >= MOQ that is a multiple of PkQty and >= requirement
      let orderQty = Math.max(requirement, result.MOQ);
      
      // Round up to the next multiple of PkQty
      if (orderQty % result.PkQty !== 0) {
        orderQty = Math.ceil(orderQty / result.PkQty) * result.PkQty;
      }
      
      return orderQty;
    });
    
    return result;
  }
}

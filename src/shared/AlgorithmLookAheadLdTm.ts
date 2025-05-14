
import { Algorithm } from './Algorithm';
import { OrderSchedule } from './types';

/**
 * AlgorithmLookAheadLdTm - Looks ahead LdTm weeks and orders accordingly
 * Places orders for future demand and skips LdTm weeks
 */
export class AlgorithmLookAheadLdTm extends Algorithm {
  constructor() {
    super("LookAheadLdTm", "Looks ahead LdTm weeks and orders, then skips LdTm weeks");
  }

  /**
   * Implementation of the algorithm method for LookAheadLdTm
   * Uses a look-ahead approach based on lead time
   */
  protected algorithm(orderSchedule: OrderSchedule): OrderSchedule {
    // Create a copy to avoid modifying the input
    const result: OrderSchedule = { ...orderSchedule };
    
    // Initialize all orders to zero
    result.Ord = new Array(result.Rqt.length).fill(0);
    
    // Iterate through time periods, skipping ahead by LdTm each time
    for (let week = 0; week < result.Rqt.length; week += result.LdTm) {
      let totalRqt = 0;
      let totalInRec = 0;
      
      // Sum up the requirements and incoming receipts for the next LdTm weeks
      for (let i = 0; i < result.LdTm && week + i < result.Rqt.length; i++) {
        totalRqt += result.Rqt[week + i];
        totalInRec += result.InRec[week + i];
      }
      
      // Calculate net requirements
      let tmp = totalRqt - totalInRec;
      tmp = Math.max(0, tmp); // Ensure non-negative
      
      // Ensure order meets MOQ and is a multiple of PkQty
      if (tmp > 0) {
        // Apply MOQ
        tmp = Math.max(tmp, result.MOQ);
        
        // Round up to nearest multiple of PkQty
        if (tmp % result.PkQty !== 0) {
          tmp = Math.ceil(tmp / result.PkQty) * result.PkQty;
        }
        
        // Set the order for this week
        result.Ord[week] = tmp;
      }
    }
    
    return result;
  }
}

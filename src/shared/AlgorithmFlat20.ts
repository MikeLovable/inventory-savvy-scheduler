
import { Algorithm } from './Algorithm';
import { OrderSchedule } from './types';

/**
 * AlgorithmFlat20 - Orders exactly 20 units each period, regardless of requirements or inventory
 */
export class AlgorithmFlat20 extends Algorithm {
  constructor() {
    super("Flat20", "Orders 20 units, regardless of Rqt or Inv");
  }

  /**
   * Implementation of the algorithm method for Flat20
   * Simply sets all order quantities to 20
   */
  protected algorithm(orderSchedule: OrderSchedule): OrderSchedule {
    // Create a copy to avoid modifying the input directly
    const result: OrderSchedule = { ...orderSchedule };
    
    // Set each order quantity to exactly 20
    result.Ord = result.Ord.map(() => 20);
    
    return result;
  }
}

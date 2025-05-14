
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PERIODS } from '../shared/types';
import { OrderScheduleArray } from '../shared/types';
import { getAlgorithmByName } from '../shared/algorithms';
import { toast } from "@/components/ui/use-toast";

interface ManualOrderScheduleTableProps {
  orderSchedules: OrderScheduleArray;
  onUpdateOrderSchedule: (index: number, updatedSchedule: OrderScheduleArray[0]) => void;
}

// Helper function to get class based on inventory status
const getInventoryClass = (orderSchedule: OrderScheduleArray[0], weekIndex: number) => {
  // Check if inventory is zero
  if (orderSchedule.Inv[weekIndex] === 0) {
    return 'bg-red-200';
  }
  
  // Check for high inventory over consecutive weeks
  if (
    weekIndex > 0 && 
    orderSchedule.Inv[weekIndex] > 3 * orderSchedule.InvTgt && 
    orderSchedule.Inv[weekIndex - 1] > 3 * orderSchedule.InvTgt
  ) {
    return 'bg-orange-200';
  }
  
  return '';
};

// Generate array of weeks
const getWeeks = () => {
  return Array.from({ length: PERIODS + 1 }, (_, i) => i);
};

// Function to adjust order value according to MOQ and PkQty rules
const adjustOrderValue = (value: number, MOQ: number, PkQty: number, direction: 'up' | 'down' | 'neutral'): { value: number, adjusted: boolean, message?: string } => {
  let adjustedValue = value;
  let wasAdjusted = false;
  let message;
  
  // If the value is 0, we don't need to apply any rules
  if (value === 0) {
    return { value: 0, adjusted: false };
  }
  
  // If going down and value is less than MOQ, set to 0 or MOQ
  if (direction === 'down' && value < MOQ) {
    adjustedValue = 0;
    wasAdjusted = true;
    message = `Order reduced to 0 (below minimum order quantity of ${MOQ})`;
    return { value: adjustedValue, adjusted: wasAdjusted, message };
  }
  
  // Enforce minimum order quantity (MOQ)
  if (value > 0 && value < MOQ) {
    if (direction === 'up' || direction === 'neutral') {
      adjustedValue = MOQ;
      wasAdjusted = true;
      message = `Order adjusted to minimum order quantity (MOQ): ${MOQ}`;
    }
  }
  
  // Enforce package quantity (PkQty) - order must be a multiple of package quantity
  if (value > 0 && PkQty > 1) {
    const remainder = adjustedValue % PkQty;
    if (remainder !== 0) {
      // Adjust based on direction
      if (direction === 'up' || direction === 'neutral') {
        // Round up to next multiple of PkQty
        adjustedValue = adjustedValue + (PkQty - remainder);
        wasAdjusted = true;
        message = `Order adjusted up to be a multiple of package quantity (PkQty): ${PkQty}`;
      } else if (direction === 'down') {
        // Round down to previous multiple of PkQty
        adjustedValue = adjustedValue - remainder;
        
        // If after rounding down, the value is now less than MOQ, set to 0
        if (adjustedValue < MOQ && adjustedValue > 0) {
          adjustedValue = 0;
          message = `Order reduced to 0 (below minimum order quantity of ${MOQ})`;
        } else {
          message = `Order adjusted down to be a multiple of package quantity (PkQty): ${PkQty}`;
        }
        
        wasAdjusted = true;
      }
    }
  }
  
  return { value: adjustedValue, adjusted: wasAdjusted, message };
};

export const ManualOrderScheduleTable: React.FC<ManualOrderScheduleTableProps> = ({ 
  orderSchedules,
  onUpdateOrderSchedule
}) => {
  const weeks = getWeeks();
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [previousValue, setPreviousValue] = useState<number>(0);
  
  // Handle changing an order value
  const handleOrderChange = (scheduleIndex: number, weekIndex: number, value: string) => {
    // Parse the input value
    let numValue = parseInt(value, 10);
    
    // If it's not a number, return
    if (isNaN(numValue)) {
      numValue = 0;
    }
    
    // Get the schedule
    const schedule = orderSchedules[scheduleIndex];
    
    // Determine direction of change
    const currentValue = schedule.Ord[weekIndex];
    const direction = numValue > currentValue ? 'up' : numValue < currentValue ? 'down' : 'neutral';
    
    // Adjust value according to MOQ and PkQty rules
    const { value: adjustedValue, adjusted, message } = adjustOrderValue(numValue, schedule.MOQ, schedule.PkQty, direction);
    
    // Show toast if value was adjusted and there's a message
    if (adjusted && message) {
      toast({
        title: "Order Quantity Adjusted",
        description: message,
      });
    }
    
    // Create a copy of the schedule
    const updatedSchedule = { ...orderSchedules[scheduleIndex] };
    
    // Update the Ord value with the adjusted value
    updatedSchedule.Ord = [...updatedSchedule.Ord];
    updatedSchedule.Ord[weekIndex] = adjustedValue;
    
    // Reset Rec and Inv arrays for complete recalculation
    updatedSchedule.Rec = new Array(updatedSchedule.Rqt.length).fill(0);
    updatedSchedule.Inv = [updatedSchedule.Inv[0]]; // Keep only initial inventory
    
    // Recalculate impacts
    try {
      // Use the Algorithm's calculateOrderScheduleImpacts method to fully recalculate impacts
      const algorithm = getAlgorithmByName('SmartReplenish');
      const resultSchedule = algorithm.calculateOrderScheduleImpacts(updatedSchedule);
      
      // Update the schedule
      onUpdateOrderSchedule(scheduleIndex, resultSchedule);
    } catch (error) {
      console.error('Error recalculating order schedule impacts:', error);
    }
  };

  const handleColumnHover = (index: number | null) => {
    setHoveredColumn(index);
  };
  
  return (
    <div className="overflow-auto rounded-md shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
      <Table className="border-collapse [&_tr:hover]:bg-blue-50">
        <TableHeader>
          <TableRow>
            <TableHead className="border border-gray-300 bg-blue-100 font-semibold">MPN</TableHead>
            <TableHead className="border border-gray-300 bg-blue-100 font-semibold">MPNAttrs</TableHead>
            <TableHead className="border border-gray-300 bg-blue-100 font-semibold">Notes</TableHead>
            <TableHead className="border border-gray-300 bg-blue-100 font-semibold">Dir</TableHead>
            <TableHead className="border border-gray-300 bg-blue-100 font-semibold">KPI</TableHead>
            {weeks.map(week => (
              <TableHead 
                key={week} 
                className={`border border-gray-300 text-center bg-blue-100 ${hoveredColumn === week ? 'bg-blue-200' : ''} font-semibold`}
                onMouseEnter={() => handleColumnHover(week)}
                onMouseLeave={() => handleColumnHover(null)}
              >
                Week {week}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderSchedules.map((schedule, scheduleIndex) => (
            <React.Fragment key={scheduleIndex}>
              {/* Input row group */}
              <TableRow className={scheduleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell rowSpan={7} className="border border-gray-300 align-middle">
                  {schedule.MPN}
                </TableCell>
                <TableCell rowSpan={7} className="border border-gray-300 align-middle text-xs">
                  LdTm[{schedule.LdTm}]<br />
                  MOQ[{schedule.MOQ}]<br />
                  PkQty[{schedule.PkQty}]<br />
                  InvTgt[{schedule.InvTgt}]<br />
                  SStok[{schedule.SStok}]
                </TableCell>
                <TableCell rowSpan={7} className="border border-gray-300 align-middle">
                  {schedule.Notes}
                </TableCell>
                <TableCell rowSpan={3} className="border border-gray-300 align-middle bg-indigo-50 font-medium">
                  In
                </TableCell>
                <TableCell className="border border-gray-300 bg-indigo-50 font-medium">Rqt</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-blue-50' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {schedule.Rqt[week]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className={scheduleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="border border-gray-300 bg-indigo-50 font-medium">Rec</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-blue-50' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {schedule.InRec[week]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className={scheduleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="border border-gray-300 bg-indigo-50 font-medium">Inv</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-blue-50' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {week === 0 ? schedule.Inv[0] : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Output row group */}
              <TableRow className={scheduleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell rowSpan={4} className="border border-gray-300 align-middle bg-teal-50 font-medium">
                  Out
                </TableCell>
                <TableCell className="border border-gray-300 bg-teal-50 font-medium">Rqt</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-blue-50' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {schedule.Rqt[week]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className={scheduleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="border border-gray-300 bg-teal-50 font-medium">Ord</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center p-0 ${hoveredColumn === week ? 'bg-blue-50' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    <Input 
                      type="number" 
                      min="0"
                      value={schedule.Ord[week]} 
                      onChange={(e) => handleOrderChange(scheduleIndex, week, e.target.value)}
                      onFocus={() => setPreviousValue(schedule.Ord[week])}
                      className="border-0 h-8 text-center"
                    />
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className={scheduleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="border border-gray-300 bg-teal-50 font-medium">Rec</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-blue-50' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {schedule.Rec[week]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className={scheduleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="border border-gray-300 bg-teal-50 font-medium">Inv</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-blue-50' : ''} ${getInventoryClass(schedule, week)}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {schedule.Inv[week]}
                  </TableCell>
                ))}
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

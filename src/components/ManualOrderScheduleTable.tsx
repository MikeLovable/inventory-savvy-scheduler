
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PERIODS } from '../shared/types';
import { OrderScheduleArray } from '../shared/types';
import { getAlgorithmByName } from '../shared/algorithms';
import { toast } from "sonner";

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
const adjustOrderValue = (value: number, MOQ: number, PkQty: number): { value: number, adjusted: boolean } => {
  // Enforce minimum order quantity (MOQ)
  let adjustedValue = value;
  let wasAdjusted = false;
  
  if (value > 0 && value < MOQ) {
    adjustedValue = MOQ;
    wasAdjusted = true;
  }
  
  // Enforce package quantity (PkQty) - order must be a multiple of package quantity
  if (value > 0 && PkQty > 1) {
    const remainder = adjustedValue % PkQty;
    if (remainder !== 0) {
      // Round up to next multiple of PkQty
      adjustedValue = adjustedValue + (PkQty - remainder);
      wasAdjusted = true;
    }
  }
  
  return { value: adjustedValue, adjusted: wasAdjusted };
};

export const ManualOrderScheduleTable: React.FC<ManualOrderScheduleTableProps> = ({ 
  orderSchedules,
  onUpdateOrderSchedule
}) => {
  const weeks = getWeeks();
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  
  // Handle changing an order value
  const handleOrderChange = (scheduleIndex: number, weekIndex: number, value: string) => {
    // Parse the input value
    let numValue = parseInt(value, 10);
    
    // If it's not a number, return
    if (isNaN(numValue) || numValue < 0) {
      numValue = 0;
    }
    
    // Get the schedule
    const schedule = orderSchedules[scheduleIndex];
    
    // Adjust value according to MOQ and PkQty rules
    const { value: adjustedValue, adjusted } = adjustOrderValue(numValue, schedule.MOQ, schedule.PkQty);
    
    // Show toast if value was adjusted
    if (adjusted && numValue > 0) {
      if (numValue < schedule.MOQ) {
        toast.info(`Order adjusted to minimum order quantity (MOQ): ${schedule.MOQ}`);
      } else {
        toast.info(`Order adjusted to be a multiple of package quantity (PkQty): ${schedule.PkQty}`);
      }
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
    <div className="overflow-auto">
      <Table className="border-collapse [&_tr:hover]:bg-blue-50">
        <TableHeader>
          <TableRow>
            <TableHead className="border border-gray-300 bg-blue-100">MPN</TableHead>
            <TableHead className="border border-gray-300 bg-blue-100">MPNAttrs</TableHead>
            <TableHead className="border border-gray-300 bg-blue-100">Notes</TableHead>
            <TableHead className="border border-gray-300 bg-blue-100">Dir</TableHead>
            <TableHead className="border border-gray-300 bg-blue-100">KPI</TableHead>
            {weeks.map(week => (
              <TableHead 
                key={week} 
                className={`border border-gray-300 text-center bg-blue-100 ${hoveredColumn === week ? 'bg-blue-200' : ''}`}
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
                <TableCell rowSpan={6} className="border border-gray-300 align-middle">
                  {schedule.MPN}
                </TableCell>
                <TableCell rowSpan={6} className="border border-gray-300 align-middle text-xs">
                  LdTm[{schedule.LdTm}]<br />
                  MOQ[{schedule.MOQ}]<br />
                  PkQty[{schedule.PkQty}]<br />
                  InvTgt[{schedule.InvTgt}]<br />
                  SStok[{schedule.SStok}]
                </TableCell>
                <TableCell rowSpan={6} className="border border-gray-300 align-middle">
                  {schedule.Notes}
                </TableCell>
                <TableCell rowSpan={3} className="border border-gray-300 align-middle bg-indigo-50">
                  In
                </TableCell>
                <TableCell className="border border-gray-300 bg-indigo-50">Rqt</TableCell>
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
                <TableCell className="border border-gray-300 bg-indigo-50">Rec</TableCell>
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
                <TableCell className="border border-gray-300 bg-indigo-50">Inv</TableCell>
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
                <TableCell rowSpan={3} className="border border-gray-300 align-middle bg-teal-50">
                  Out
                </TableCell>
                <TableCell className="border border-gray-300 bg-teal-50">Rqt</TableCell>
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
                <TableCell className="border border-gray-300 bg-teal-50">Ord</TableCell>
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
                      className="border-0 h-8 text-center"
                    />
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className={scheduleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="border border-gray-300 bg-teal-50">Rec</TableCell>
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
                <TableCell className="border border-gray-300 bg-teal-50">Inv</TableCell>
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

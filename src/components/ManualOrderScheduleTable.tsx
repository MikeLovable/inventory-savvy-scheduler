
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PERIODS } from '../shared/types';
import { OrderScheduleArray } from '../shared/types';
import { getAlgorithmByName } from '../shared/algorithms';

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

export const ManualOrderScheduleTable: React.FC<ManualOrderScheduleTableProps> = ({ 
  orderSchedules,
  onUpdateOrderSchedule
}) => {
  const weeks = getWeeks();
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  
  // Handle changing an order value
  const handleOrderChange = (scheduleIndex: number, weekIndex: number, value: string) => {
    // Parse the input value
    const numValue = parseInt(value, 10);
    
    // If it's not a number, return
    if (isNaN(numValue)) {
      return;
    }
    
    // Create a copy of the schedule
    const updatedSchedule = { ...orderSchedules[scheduleIndex] };
    
    // Update the Ord value
    updatedSchedule.Ord = [...updatedSchedule.Ord];
    updatedSchedule.Ord[weekIndex] = numValue;
    
    // Reset Rec and Inv arrays since we need to recalculate them fully
    updatedSchedule.Rec = new Array(updatedSchedule.Rqt.length).fill(0);
    updatedSchedule.Inv = [...updatedSchedule.Inv]; // Keep initial inventory
    
    // Recalculate impacts
    try {
      // We'll use the Algorithm's calculateOrderScheduleImpacts method to fully recalculate impacts
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
      <Table className="border-collapse [&_tr:nth-child(even)]:bg-gray-50">
        <TableHeader>
          <TableRow>
            <TableHead className="border border-gray-300">MPN</TableHead>
            <TableHead className="border border-gray-300">MPNAttrs</TableHead>
            <TableHead className="border border-gray-300">Notes</TableHead>
            <TableHead className="border border-gray-300">Dir</TableHead>
            <TableHead className="border border-gray-300">KPI</TableHead>
            {weeks.map(week => (
              <TableHead 
                key={week} 
                className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-gray-100' : ''}`}
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
              <TableRow className="hover:bg-gray-100">
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
                <TableCell rowSpan={3} className="border border-gray-300 align-middle">
                  In
                </TableCell>
                <TableCell className="border border-gray-300">Rqt</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-gray-100' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {schedule.Rqt[week]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-gray-100">
                <TableCell className="border border-gray-300">Rec</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-gray-100' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {schedule.InRec[week]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-gray-100">
                <TableCell className="border border-gray-300">Inv</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-gray-100' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {week === 0 ? schedule.Inv[0] : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Output row group */}
              <TableRow className="hover:bg-gray-100">
                <TableCell rowSpan={4} className="border border-gray-300 align-middle">
                  Out
                </TableCell>
                <TableCell className="border border-gray-300">Rqt</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-gray-100' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {schedule.Rqt[week]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-gray-100">
                <TableCell className="border border-gray-300">Ord</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center p-0 ${hoveredColumn === week ? 'bg-gray-100' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    <Input 
                      type="number" 
                      min="0" 
                      max="400" 
                      value={schedule.Ord[week]} 
                      onChange={(e) => handleOrderChange(scheduleIndex, week, e.target.value)}
                      className="border-0 h-8 text-center"
                    />
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-gray-100">
                <TableCell className="border border-gray-300">Rec</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-gray-100' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {schedule.Rec[week]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-gray-100">
                <TableCell className="border border-gray-300">Inv</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-gray-100' : ''} ${getInventoryClass(schedule, week)}`}
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

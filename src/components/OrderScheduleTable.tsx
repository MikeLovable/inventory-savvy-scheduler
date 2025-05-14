
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PERIODS } from '../shared/types';
import { OrderScheduleArray } from '../shared/types';

interface OrderScheduleTableProps {
  orderSchedules: OrderScheduleArray;
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

export const OrderScheduleTable: React.FC<OrderScheduleTableProps> = ({ orderSchedules }) => {
  const weeks = getWeeks();
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  
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
                    className={`border border-gray-300 text-center ${hoveredColumn === week ? 'bg-blue-50' : ''}`}
                    onMouseEnter={() => handleColumnHover(week)}
                    onMouseLeave={() => handleColumnHover(null)}
                  >
                    {schedule.Ord[week]}
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

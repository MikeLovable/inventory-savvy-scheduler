
import React from 'react';
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
                className="border border-gray-300 text-center hover:bg-gray-100"
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
                    className="border border-gray-300 text-center hover:bg-gray-100"
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
                    className="border border-gray-300 text-center hover:bg-gray-100"
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
                    className="border border-gray-300 text-center hover:bg-gray-100"
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
                    className="border border-gray-300 text-center hover:bg-gray-100"
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
                    className="border border-gray-300 text-center hover:bg-gray-100"
                  >
                    {schedule.Ord[week]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-gray-100">
                <TableCell className="border border-gray-300">Rec</TableCell>
                {weeks.map(week => (
                  <TableCell 
                    key={week} 
                    className="border border-gray-300 text-center hover:bg-gray-100"
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
                    className="border border-gray-300 text-center hover:bg-gray-100 
                    ${getInventoryClass(schedule, week)}"
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

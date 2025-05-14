
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { PERIODS } from '../shared/types';
import { ProductionScenarioArray } from '../shared/types';

interface ProductionScenarioTableProps {
  productionScenarios: ProductionScenarioArray;
  toggleSelect: (index: number, checked: boolean) => void;
}

// Generate array of weeks
const getWeeks = () => {
  return Array.from({ length: PERIODS + 1 }, (_, i) => i);
};

export const ProductionScenarioTable: React.FC<ProductionScenarioTableProps> = ({ 
  productionScenarios, 
  toggleSelect 
}) => {
  const weeks = getWeeks();
  
  return (
    <div className="overflow-auto">
      <Table className="border-collapse">
        <TableHeader>
          <TableRow>
            <TableHead className="border border-gray-300">Sel</TableHead>
            <TableHead className="border border-gray-300">MPN</TableHead>
            <TableHead className="border border-gray-300">MPNAttrs</TableHead>
            <TableHead className="border border-gray-300">Dir</TableHead>
            <TableHead className="border border-gray-300">KPI</TableHead>
            {weeks.map(week => (
              <TableHead key={week} className="border border-gray-300 text-center">
                {week}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {productionScenarios.map((scenario, scenarioIndex) => (
            <React.Fragment key={scenarioIndex}>
              {/* Input row group */}
              <TableRow>
                <TableCell rowSpan={3} className="border border-gray-300 align-middle">
                  <Checkbox 
                    checked={scenario.Sel} 
                    onCheckedChange={(checked) => toggleSelect(scenarioIndex, !!checked)} 
                  />
                </TableCell>
                <TableCell rowSpan={3} className="border border-gray-300 align-middle">
                  {scenario.MPN}
                </TableCell>
                <TableCell rowSpan={3} className="border border-gray-300 align-middle text-xs">
                  LdTm[{scenario.LdTm}]<br />
                  MOQ[{scenario.MOQ}]<br />
                  PkQty[{scenario.PkQty}]<br />
                  InvTgt[{scenario.InvTgt}]<br />
                  SStok[{scenario.SStok}]
                </TableCell>
                <TableCell rowSpan={3} className="border border-gray-300 align-middle">
                  In
                </TableCell>
                <TableCell className="border border-gray-300">Rqt</TableCell>
                {weeks.map(week => (
                  <TableCell key={week} className="border border-gray-300 text-center">
                    {scenario.Rqt[week]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="border border-gray-300">Rec</TableCell>
                {weeks.map(week => (
                  <TableCell key={week} className="border border-gray-300 text-center">
                    {scenario.Rec[week]}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="border border-gray-300">Inv</TableCell>
                {weeks.map(week => (
                  <TableCell key={week} className="border border-gray-300 text-center">
                    {week === 0 ? scenario.Inv[0] : 'N/A'}
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

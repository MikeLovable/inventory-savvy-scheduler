
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { OrderScheduleArray } from '../shared/types';

interface ManualOutputTabProps {
  manualOrderSchedules: OrderScheduleArray;
}

const ManualOutputTab: React.FC<ManualOutputTabProps> = ({ manualOrderSchedules }) => {
  return (
    <TabsContent value="manual-output" className="py-4">
      <Card className="border-blue-200 shadow-md bg-gradient-to-r from-white to-blue-50">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b border-blue-200">
          <CardTitle className="text-blue-800">Human In the Loop Order Schedule</CardTitle>
        </CardHeader>
        <CardContent className="bg-white p-4">
          <Textarea 
            readOnly
            value={JSON.stringify(manualOrderSchedules, null, 2)}
            className="min-h-[500px] font-mono text-sm bg-gray-50 border-blue-200 shadow-inner"
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default ManualOutputTab;

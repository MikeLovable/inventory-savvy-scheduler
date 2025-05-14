
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
      <Card className="border-blue-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="text-blue-700">Human In the Loop Order Schedule</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <Textarea 
            readOnly
            value={JSON.stringify(manualOrderSchedules, null, 2)}
            className="min-h-[500px] font-mono text-sm bg-gray-50 border-blue-200"
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default ManualOutputTab;

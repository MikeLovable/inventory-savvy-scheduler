
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabsContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

const TabsContainer: React.FC<TabsContainerProps> = ({ activeTab, setActiveTab, children }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-4">
        <TabsTrigger value="data-config">Data/Config</TabsTrigger>
        <TabsTrigger value="batch">Batch</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
        <TabsTrigger value="manual-output">ManualOutput</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default TabsContainer;

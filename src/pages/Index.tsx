
import React, { useState } from 'react';
import Header from '../components/Header';
import TabsContainer from '../components/Tabs';
import DataConfigTab from '../components/DataConfigTab';
import BatchTab from '../components/BatchTab';
import ManualTab from '../components/ManualTab';
import ManualOutputTab from '../components/ManualOutputTab';
import { PERIODS, OrderScheduleArray, ProductionScenarioArray } from '../shared/types';
import { GetProductionScenarios } from '../shared/dataSources';
import { getAlgorithmByName } from '../shared/algorithms';

const Index = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('manual');
  
  // State for selected data source and algorithm
  const [selectedDataSource, setSelectedDataSource] = useState('Customer');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('SmartReplenish');
  
  // State for production scenarios
  const [productionScenarios, setProductionScenarios] = useState<ProductionScenarioArray>([]);
  
  // State for order schedules
  const [orderSchedules, setOrderSchedules] = useState<OrderScheduleArray>([]);
  const [manualOrderSchedules, setManualOrderSchedules] = useState<OrderScheduleArray>([]);
  
  // Initialize data on first render
  React.useEffect(() => {
    try {
      // Get initial production scenarios
      const initialScenarios = GetProductionScenarios(selectedDataSource);
      setProductionScenarios(initialScenarios);
      
      // Calculate initial order schedules
      const algorithm = getAlgorithmByName(selectedAlgorithm);
      const schedules = algorithm.calculateOrderScheduleArray(initialScenarios);
      setOrderSchedules(schedules);
      setManualOrderSchedules(schedules);
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <TabsContainer activeTab={activeTab} setActiveTab={setActiveTab}>
          <DataConfigTab 
            selectedDataSource={selectedDataSource}
            setSelectedDataSource={setSelectedDataSource}
          />
          
          <BatchTab 
            selectedDataSource={selectedDataSource}
            setSelectedDataSource={setSelectedDataSource}
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
            productionScenarios={productionScenarios}
            setProductionScenarios={setProductionScenarios}
            orderSchedules={orderSchedules}
            setOrderSchedules={setOrderSchedules}
          />
          
          <ManualTab 
            selectedDataSource={selectedDataSource}
            setSelectedDataSource={setSelectedDataSource}
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
            productionScenarios={productionScenarios}
            setProductionScenarios={setProductionScenarios}
            manualOrderSchedules={manualOrderSchedules}
            setManualOrderSchedules={setManualOrderSchedules}
          />
          
          <ManualOutputTab 
            manualOrderSchedules={manualOrderSchedules} 
          />
        </TabsContainer>
      </main>
    </div>
  );
};

export default Index;

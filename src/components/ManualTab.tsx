import React, { useState } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { GetProductionScenarios, getDataSourceByName } from '../shared/dataSources';
import { getAlgorithmByName } from '../shared/algorithms';
import { ProductionScenarioTable } from './ProductionScenarioTable';
import { ManualOrderScheduleTable } from './ManualOrderScheduleTable';
import { DataSource, OrderScheduleArray, ProductionScenarioArray } from '../shared/types';
import { fetchProductionScenarios, fetchOrderRecommendations } from '../api/api';

interface ManualTabProps {
  selectedDataSource: string;
  setSelectedDataSource: (dataSource: string) => void;
  selectedAlgorithm: string;
  setSelectedAlgorithm: (algorithm: string) => void;
  productionScenarios: ProductionScenarioArray;
  setProductionScenarios: (scenarios: ProductionScenarioArray) => void;
  manualOrderSchedules: OrderScheduleArray;
  setManualOrderSchedules: (schedules: OrderScheduleArray) => void;
}

const ManualTab: React.FC<ManualTabProps> = ({ 
  selectedDataSource, 
  setSelectedDataSource,
  selectedAlgorithm,
  setSelectedAlgorithm,
  productionScenarios,
  setProductionScenarios,
  manualOrderSchedules,
  setManualOrderSchedules
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Toggle selection for all scenarios
  const toggleSelectAll = (checked: boolean) => {
    const updatedScenarios = productionScenarios.map(scenario => ({
      ...scenario,
      Sel: checked
    }));
    setProductionScenarios(updatedScenarios);
  };
  
  // Toggle selection for a specific scenario
  const toggleSelect = (index: number, checked: boolean) => {
    const updatedScenarios = [...productionScenarios];
    updatedScenarios[index] = {
      ...updatedScenarios[index],
      Sel: checked
    };
    setProductionScenarios(updatedScenarios);
  };
  
  const handleGetLocalScenarios = async () => {
    try {
      setIsLoading(true);
      const startTime = performance.now();
      
      // Get the production scenarios locally
      const scenarios = GetProductionScenarios(selectedDataSource);
      setProductionScenarios(scenarios);
      
      const endTime = performance.now();
      const elapsed = (endTime - startTime).toFixed(2);
      
      toast({
        title: "Success",
        description: `Successfully retrieved ${scenarios.length} local scenarios in ${elapsed}ms`,
      });
      
      // Update the stored data source
      const dataSource: DataSource = getDataSourceByName(selectedDataSource);
      dataSource.ProductionScenarioArray = scenarios;
    } catch (error) {
      console.error('Error getting local scenarios:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error getting local scenarios: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGetAPIScenarios = async () => {
    try {
      setIsLoading(true);
      const startTime = performance.now();
      
      // Get the production scenarios from the API
      const scenarios = await fetchProductionScenarios(selectedDataSource);
      setProductionScenarios(scenarios);
      
      const endTime = performance.now();
      const elapsed = (endTime - startTime).toFixed(2);
      
      toast({
        title: "Success",
        description: `Successfully retrieved ${scenarios.length} API scenarios in ${elapsed}ms`,
      });
      
      // Update the stored data source
      const dataSource: DataSource = getDataSourceByName(selectedDataSource);
      dataSource.ProductionScenarioArray = scenarios;
    } catch (error) {
      console.error('Error getting API scenarios:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error getting API scenarios: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGetLocalOrderRecommendations = async () => {
    try {
      setIsLoading(true);
      const startTime = performance.now();
      
      // Get the algorithm
      const algorithm = getAlgorithmByName(selectedAlgorithm);
      
      // Filter the selected scenarios
      const selectedScenarios = productionScenarios.filter(scenario => scenario.Sel);
      
      if (selectedScenarios.length === 0) {
        toast({
          variant: "warning",
          title: "Warning",
          description: "No scenarios selected. Please select at least one scenario.",
        });
        return;
      }
      
      // Calculate order schedules
      const schedules = algorithm.calculateOrderScheduleArray(selectedScenarios);
      setManualOrderSchedules(schedules);
      
      const endTime = performance.now();
      const elapsed = (endTime - startTime).toFixed(2);
      
      toast({
        title: "Success",
        description: `Successfully calculated ${schedules.length} local order schedules in ${elapsed}ms`,
      });
    } catch (error) {
      console.error('Error calculating local order recommendations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error calculating local order recommendations: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGetAPIOrderRecommendations = async () => {
    try {
      setIsLoading(true);
      const startTime = performance.now();
      
      // Filter the selected scenarios
      const selectedScenarios = productionScenarios.filter(scenario => scenario.Sel);
      
      if (selectedScenarios.length === 0) {
        toast({
          variant: "warning",
          title: "Warning",
          description: "No scenarios selected. Please select at least one scenario.",
        });
        return;
      }
      
      // Get order recommendations from the API
      const schedules = await fetchOrderRecommendations(selectedScenarios, selectedAlgorithm);
      setManualOrderSchedules(schedules);
      
      const endTime = performance.now();
      const elapsed = (endTime - startTime).toFixed(2);
      
      toast({
        title: "Success",
        description: `Successfully calculated ${schedules.length} API order schedules in ${elapsed}ms`,
      });
    } catch (error) {
      console.error('Error calculating API order recommendations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error calculating API order recommendations: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate if all are selected
  const allSelected = productionScenarios.length > 0 && productionScenarios.every(scenario => scenario.Sel);
  
  // Update a specific order schedule
  const handleUpdateOrderSchedule = (index: number, updatedSchedule: OrderScheduleArray[0]) => {
    const updatedSchedules = [...manualOrderSchedules];
    updatedSchedules[index] = updatedSchedule;
    setManualOrderSchedules(updatedSchedules);
  };
  
  return (
    <TabsContent value="manual" className="py-4">
      <div className="space-y-6">
        <Card className="border-blue-200 shadow-md">
          <CardContent className="pt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="space-y-4">
              {/* DataSource selection */}
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <div className="flex-1">
                  <label className="text-sm font-medium text-blue-700 mb-1 block">Data Source</label>
                  <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                    <SelectTrigger className="border-blue-200 focus:ring-blue-400">
                      <SelectValue placeholder="Select a data source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="StaticRandom">StaticRandom</SelectItem>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Scenario3">Scenario3</SelectItem>
                      <SelectItem value="Random">Random</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleGetLocalScenarios} 
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    GetLocalScenarios
                  </Button>
                  <Button 
                    onClick={handleGetAPIScenarios} 
                    disabled={isLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    GetAPIScenarios
                  </Button>
                </div>
              </div>
              
              {/* Algorithm selection */}
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <div className="flex-1">
                  <label className="text-sm font-medium text-blue-700 mb-1 block">Algorithm</label>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger className="border-blue-200 focus:ring-blue-400">
                      <SelectValue placeholder="Select an algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flat20">Flat20</SelectItem>
                      <SelectItem value="NaiveReplenish">NaiveReplenish</SelectItem>
                      <SelectItem value="SmartReplenish">SmartReplenish</SelectItem>
                      <SelectItem value="AIDesigned">AIDesigned</SelectItem>
                      <SelectItem value="LookAheadLdTm">LookAheadLdTm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleGetLocalOrderRecommendations} 
                    disabled={isLoading || productionScenarios.length === 0}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    GetLocalOrderRecommendations
                  </Button>
                  <Button 
                    onClick={handleGetAPIOrderRecommendations} 
                    disabled={isLoading || productionScenarios.length === 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    GetAPIOrderRecommendations
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* ProductionScenarioTable */}
        {productionScenarios.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 flex items-center">
              <Checkbox 
                id="select-all" 
                checked={allSelected} 
                onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                className="border-blue-500 text-blue-600 focus:ring-blue-400" 
              />
              <label htmlFor="select-all" className="ml-2 text-sm font-medium text-blue-700">
                Select All
              </label>
            </div>
            <ProductionScenarioTable 
              productionScenarios={productionScenarios}
              toggleSelect={toggleSelect}
            />
          </div>
        )}
        
        {/* ManualOrderScheduleTable */}
        {manualOrderSchedules.length > 0 && (
          <div className="mt-6 space-y-2">
            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-blue-700 mb-2">Order Schedule Legend</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-red-200 rounded-full mr-1"></span>
                  <span>Inventory reaches zero</span>
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-orange-200 rounded-full mr-1"></span>
                  <span>Inventory &gt; 3x target for 2+ weeks</span>
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-blue-50 rounded-full mr-1"></span>
                  <span>Column hover highlight</span>
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-indigo-50 rounded-full mr-1"></span>
                  <span>Input section</span>
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-teal-50 rounded-full mr-1"></span>
                  <span>Output section</span>
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Note: Order values will be adjusted to comply with MOQ and PkQty constraints.</p>
              </div>
            </div>
            <ManualOrderScheduleTable 
              orderSchedules={manualOrderSchedules} 
              onUpdateOrderSchedule={handleUpdateOrderSchedule}
            />
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default ManualTab;

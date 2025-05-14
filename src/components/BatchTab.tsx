
import React, { useState } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { GetProductionScenarios, getDataSourceByName } from '../shared/dataSources';
import { getAlgorithmByName } from '../shared/algorithms';
import { OrderScheduleTable } from './OrderScheduleTable';
import { DataSource, OrderScheduleArray, ProductionScenarioArray } from '../shared/types';
import { fetchProductionScenarios, fetchOrderRecommendations } from '../api/api';

interface BatchTabProps {
  selectedDataSource: string;
  setSelectedDataSource: (dataSource: string) => void;
  selectedAlgorithm: string;
  setSelectedAlgorithm: (algorithm: string) => void;
  productionScenarios: ProductionScenarioArray;
  setProductionScenarios: (scenarios: ProductionScenarioArray) => void;
  orderSchedules: OrderScheduleArray;
  setOrderSchedules: (schedules: OrderScheduleArray) => void;
}

const BatchTab: React.FC<BatchTabProps> = ({ 
  selectedDataSource, 
  setSelectedDataSource,
  selectedAlgorithm,
  setSelectedAlgorithm,
  productionScenarios,
  setProductionScenarios,
  orderSchedules,
  setOrderSchedules
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGetLocalScenarios = async () => {
    try {
      setIsLoading(true);
      const startTime = performance.now();
      
      // Get the production scenarios locally
      const scenarios = GetProductionScenarios(selectedDataSource);
      setProductionScenarios(scenarios);
      
      const endTime = performance.now();
      const elapsed = (endTime - startTime).toFixed(2);
      
      toast.success(`Successfully retrieved ${scenarios.length} local scenarios in ${elapsed}ms`);
      
      // Update the stored data source
      const dataSource: DataSource = getDataSourceByName(selectedDataSource);
      dataSource.ProductionScenarioArray = scenarios;
    } catch (error) {
      console.error('Error getting local scenarios:', error);
      toast.error(`Error getting local scenarios: ${error instanceof Error ? error.message : String(error)}`);
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
      
      toast.success(`Successfully retrieved ${scenarios.length} API scenarios in ${elapsed}ms`);
      
      // Update the stored data source
      const dataSource: DataSource = getDataSourceByName(selectedDataSource);
      dataSource.ProductionScenarioArray = scenarios;
    } catch (error) {
      console.error('Error getting API scenarios:', error);
      toast.error(`Error getting API scenarios: ${error instanceof Error ? error.message : String(error)}`);
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
      
      // Calculate order schedules
      const schedules = algorithm.calculateOrderScheduleArray(productionScenarios);
      setOrderSchedules(schedules);
      
      const endTime = performance.now();
      const elapsed = (endTime - startTime).toFixed(2);
      
      toast.success(`Successfully calculated ${schedules.length} local order schedules in ${elapsed}ms`);
    } catch (error) {
      console.error('Error calculating local order recommendations:', error);
      toast.error(`Error calculating local order recommendations: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGetAPIOrderRecommendations = async () => {
    try {
      setIsLoading(true);
      const startTime = performance.now();
      
      // Get order recommendations from the API
      const schedules = await fetchOrderRecommendations(productionScenarios, selectedAlgorithm);
      setOrderSchedules(schedules);
      
      const endTime = performance.now();
      const elapsed = (endTime - startTime).toFixed(2);
      
      toast.success(`Successfully calculated ${schedules.length} API order schedules in ${elapsed}ms`);
    } catch (error) {
      console.error('Error calculating API order recommendations:', error);
      toast.error(`Error calculating API order recommendations: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <TabsContent value="batch" className="py-4">
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* DataSource selection */}
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <div className="flex-1">
                  <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                    <SelectTrigger>
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
                    className="flex-1"
                  >
                    GetLocalScenarios
                  </Button>
                  <Button 
                    onClick={handleGetAPIScenarios} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    GetAPIScenarios
                  </Button>
                </div>
              </div>
              
              {/* Algorithm selection */}
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <div className="flex-1">
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger>
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
                    className="flex-1"
                  >
                    GetLocalOrderRecommendations
                  </Button>
                  <Button 
                    onClick={handleGetAPIOrderRecommendations} 
                    disabled={isLoading || productionScenarios.length === 0}
                    className="flex-1"
                  >
                    GetAPIOrderRecommendations
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* OrderScheduleTable */}
        {orderSchedules.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                <span>Inventory reaches zero</span>
              </span>
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1"></span>
                <span>Inventory &gt; 3x target for 2+ weeks</span>
              </span>
            </div>
            <OrderScheduleTable orderSchedules={orderSchedules} />
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default BatchTab;

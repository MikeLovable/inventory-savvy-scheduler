
import React, { useState, useEffect } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getApiBaseUrl, setApiBaseUrl } from '../api/api';
import { PERIODS, SAMPLES, setPERIODS, setSAMPLES, MIN_PERIODS, MAX_PERIODS, MIN_SAMPLES, MAX_SAMPLES } from '../shared/types';
import { getAlgorithms } from '../shared/algorithms';
import { getDataSourceByName } from '../shared/dataSources';

interface DataConfigTabProps {
  selectedDataSource: string;
  setSelectedDataSource: (dataSource: string) => void;
}

const DataConfigTab: React.FC<DataConfigTabProps> = ({ selectedDataSource, setSelectedDataSource }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [periodsValue, setPeriodsValue] = useState(PERIODS.toString());
  const [samplesValue, setSamplesValue] = useState(SAMPLES.toString());
  const [productionScenarioJson, setProductionScenarioJson] = useState('');
  
  // Get the algorithms
  const algorithms = getAlgorithms();
  
  // Load API URL from cookie on component mount
  useEffect(() => {
    const savedApiUrl = getApiBaseUrl();
    if (savedApiUrl) {
      setApiUrl(savedApiUrl);
    }
  }, []);
  
  // Update production scenario JSON when selected data source changes
  useEffect(() => {
    try {
      const dataSource = getDataSourceByName(selectedDataSource);
      setProductionScenarioJson(JSON.stringify(dataSource.ProductionScenarioArray, null, 2));
    } catch (error) {
      console.error('Error updating production scenario JSON:', error);
    }
  }, [selectedDataSource]);
  
  const handleSaveApiUrl = () => {
    try {
      // Validate URL
      new URL(apiUrl);
      
      // Save to cookie
      setApiBaseUrl(apiUrl);
      
      toast.success('API URL saved successfully');
    } catch (error) {
      toast.error('Invalid API URL');
    }
  };
  
  const handleSavePeriods = () => {
    const periodsInt = parseInt(periodsValue, 10);
    if (isNaN(periodsInt) || periodsInt < MIN_PERIODS || periodsInt > MAX_PERIODS) {
      toast.error(`PERIODS must be a number between ${MIN_PERIODS} and ${MAX_PERIODS}`);
      return;
    }
    
    setPERIODS(periodsInt);
    toast.success(`PERIODS set to ${periodsInt}`);
  };
  
  const handleSaveSamples = () => {
    const samplesInt = parseInt(samplesValue, 10);
    if (isNaN(samplesInt) || samplesInt < MIN_SAMPLES || samplesInt > MAX_SAMPLES) {
      toast.error(`SAMPLES must be a number between ${MIN_SAMPLES} and ${MAX_SAMPLES}`);
      return;
    }
    
    setSAMPLES(samplesInt);
    toast.success(`SAMPLES set to ${samplesInt}`);
  };
  
  return (
    <TabsContent value="data-config" className="py-4">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Configure the API URL for API calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="api-url">API Base URL</Label>
                <Input 
                  id="api-url" 
                  placeholder="e.g., https://api.example.com" 
                  value={apiUrl} 
                  onChange={(e) => setApiUrl(e.target.value)} 
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSaveApiUrl}>Save</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Available Algorithms</CardTitle>
            <CardDescription>List of algorithms that can be used for order scheduling</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Function</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {algorithms.map((algorithm) => (
                  <TableRow key={algorithm.Name}>
                    <TableCell>{algorithm.Name}</TableCell>
                    <TableCell>{algorithm.Desc}</TableCell>
                    <TableCell>{algorithm.constructor.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Variables</CardTitle>
              <CardDescription>Configure global variables for the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="periods">PERIODS (1-20)</Label>
                    <Input 
                      id="periods" 
                      type="number" 
                      min={MIN_PERIODS}
                      max={MAX_PERIODS}
                      value={periodsValue} 
                      onChange={(e) => setPeriodsValue(e.target.value)} 
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSavePeriods}>Save</Button>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="samples">SAMPLES (1-30)</Label>
                    <Input 
                      id="samples" 
                      type="number" 
                      min={MIN_SAMPLES}
                      max={MAX_SAMPLES}
                      value={samplesValue} 
                      onChange={(e) => setSamplesValue(e.target.value)} 
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSaveSamples}>Save</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Customer-configured Production Scenarios for demo</CardTitle>
              <CardDescription>Edit the production scenarios for the selected data source</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={productionScenarioJson}
                onChange={(e) => setProductionScenarioJson(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
};

export default DataConfigTab;


import { 
  ProductionScenarioArray,
  OrderScheduleArray,
  GetProductionScenariosRequest,
  GetProductionScenariosResponse,
  GetOrdersRequest,
  GetOrdersResponse,
  SimulateOrdersRequest,
  SimulateOrdersResponse
} from '../shared/types';

// Helper function to get the API base URL from cookie
export function getApiBaseUrl(): string {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'apiBaseUrl' && value) {
      return decodeURIComponent(value);
    }
  }
  return '';
}

// Helper function to set the API base URL cookie
export function setApiBaseUrl(url: string): void {
  document.cookie = `apiBaseUrl=${encodeURIComponent(url)};path=/;max-age=31536000`; // 1 year
}

/**
 * Fetches production scenarios from the API
 */
export async function fetchProductionScenarios(dataSource: string): Promise<ProductionScenarioArray> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('API base URL not set. Please configure it in the Data/Config tab.');
  }
  
  const url = `${baseUrl}/api/GetProductionScenarios?DataSource=${encodeURIComponent(dataSource)}`;
  
  console.log(`Fetching production scenarios from ${url}`);
  const startTime = performance.now();
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch production scenarios: ${response.status} ${response.statusText}\n${errorText}`);
  }
  
  const data: GetProductionScenariosResponse = await response.json();
  
  const endTime = performance.now();
  console.log(`Fetched ${data.productionScenarios.length} production scenarios in ${(endTime - startTime).toFixed(2)}ms`);
  
  return data.productionScenarios;
}

/**
 * Sends production scenarios to the API to get order recommendations
 */
export async function fetchOrderRecommendations(
  productionScenarios: ProductionScenarioArray, 
  algorithmName: string
): Promise<OrderScheduleArray> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('API base URL not set. Please configure it in the Data/Config tab.');
  }
  
  const url = `${baseUrl}/api/GetOrders`;
  const request: GetOrdersRequest = {
    productionScenarios,
    algorithmName
  };
  
  console.log(`Fetching order recommendations from ${url}`);
  const startTime = performance.now();
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch order recommendations: ${response.status} ${response.statusText}\n${errorText}`);
  }
  
  const data: GetOrdersResponse = await response.json();
  
  const endTime = performance.now();
  console.log(`Fetched ${data.orderSchedules.length} order schedules in ${(endTime - startTime).toFixed(2)}ms`);
  
  return data.orderSchedules;
}

/**
 * Simulates orders using the API
 */
export async function simulateOrders(
  dataSource: string,
  algorithmName: string
): Promise<OrderScheduleArray> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('API base URL not set. Please configure it in the Data/Config tab.');
  }
  
  const url = `${baseUrl}/api/SimulateOrders`;
  const request: SimulateOrdersRequest = {
    dataSource,
    algorithmName
  };
  
  console.log(`Simulating orders from ${url}`);
  const startTime = performance.now();
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to simulate orders: ${response.status} ${response.statusText}\n${errorText}`);
  }
  
  const data: SimulateOrdersResponse = await response.json();
  
  const endTime = performance.now();
  console.log(`Simulated ${data.orderSchedules.length} order schedules in ${(endTime - startTime).toFixed(2)}ms`);
  
  return data.orderSchedules;
}

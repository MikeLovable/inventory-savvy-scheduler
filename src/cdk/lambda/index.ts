
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  GetProductionScenariosRequest,
  GetProductionScenariosResponse,
  GetOrdersRequest,
  GetOrdersResponse,
  SimulateOrdersRequest,
  SimulateOrdersResponse,
  ProductionScenarioArray
} from '../../shared/types';
import { GetProductionScenarios } from '../../shared/dataSources';
import { GetOrders } from '../../shared/algorithms';

// Common headers for all responses
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
};

/**
 * Main Lambda handler that routes requests to the appropriate function
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event));
  
  try {
    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    // Route based on path
    const path = event.path.split('/').pop();
    if (!path) {
      throw new Error('Invalid path');
    }
    
    switch (path) {
      case 'GetProductionScenarios':
        return handleGetProductionScenarios(event);
      case 'GetOrders':
        return handleGetOrders(event);
      case 'SimulateOrders':
        return handleSimulateOrders(event);
      default:
        throw new Error(`Unknown path: ${path}`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      })
    };
  }
};

/**
 * Handle GetProductionScenarios API requests
 */
async function handleGetProductionScenarios(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Handling GetProductionScenarios');
  
  try {
    // Parse query string parameter
    const dataSource = event.queryStringParameters?.DataSource || 'Customer';
    console.log(`Requested DataSource: ${dataSource}`);
    
    // Get production scenarios
    const productionScenarios = GetProductionScenarios(dataSource);
    
    // Return response
    const response: GetProductionScenariosResponse = {
      productionScenarios
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error in GetProductionScenarios:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: 'Error retrieving production scenarios',
        error: error instanceof Error ? error.message : String(error)
      })
    };
  }
}

/**
 * Handle GetOrders API requests
 */
async function handleGetOrders(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Handling GetOrders');
  
  try {
    // Parse request body
    if (!event.body) {
      throw new Error('Request body is required');
    }
    
    const request: GetOrdersRequest = JSON.parse(event.body);
    console.log(`Requested Algorithm: ${request.algorithmName}`);
    
    if (!request.productionScenarios || !request.algorithmName) {
      throw new Error('productionScenarios and algorithmName are required');
    }
    
    // Get orders using the specified algorithm
    const orderSchedules = GetOrders(request.productionScenarios, request.algorithmName);
    
    // Return response
    const response: GetOrdersResponse = {
      orderSchedules
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error in GetOrders:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: 'Error calculating orders',
        error: error instanceof Error ? error.message : String(error)
      })
    };
  }
}

/**
 * Handle SimulateOrders API requests
 */
async function handleSimulateOrders(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Handling SimulateOrders');
  
  try {
    // Parse request body
    if (!event.body) {
      throw new Error('Request body is required');
    }
    
    const request: SimulateOrdersRequest = JSON.parse(event.body);
    console.log(`Requested DataSource: ${request.dataSource}, Algorithm: ${request.algorithmName}`);
    
    if (!request.dataSource || !request.algorithmName) {
      throw new Error('dataSource and algorithmName are required');
    }
    
    // Get production scenarios
    const productionScenarios = GetProductionScenarios(request.dataSource);
    
    // Get orders using the specified algorithm
    const orderSchedules = GetOrders(productionScenarios, request.algorithmName);
    
    // Return response
    const response: SimulateOrdersResponse = {
      orderSchedules
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error in SimulateOrders:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: 'Error simulating orders',
        error: error instanceof Error ? error.message : String(error)
      })
    };
  }
}

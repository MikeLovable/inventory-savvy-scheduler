
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { execSync } from 'child_process';

// Define props for the stack
export interface LovableStackProps extends cdk.StackProps {
  CustomDomain?: string;
  OriginBucket?: s3.IBucket;
  OriginBasePath: string;
}

export class AlgorithmicOrderSchedulerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LovableStackProps) {
    super(scope, id, props);

    // Create Lambda function that uses our shared code
    const lambdaFunction = new lambda.Function(this, 'AlgorthmicOrderSchedulerFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        NODE_PATH: './node_modules'
      }
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'AlgorthmicOrderSchedulerAPI', {
      restApiName: 'AlgorithmicOrderScheduler API',
      description: 'API for Algorithmic Order Scheduler',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
        allowCredentials: true,
      }
    });

    // Add routes to API Gateway
    const apiRoutes = api.root.addResource('api');

    // 1. GetProductionScenarios route
    const getProdScenarios = apiRoutes.addResource('GetProductionScenarios');
    getProdScenarios.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunction), {
      requestParameters: {
        'method.request.querystring.DataSource': false
      }
    });

    // 2. GetOrders route
    const getOrders = apiRoutes.addResource('GetOrders');
    getOrders.addMethod('POST', new apigateway.LambdaIntegration(lambdaFunction));

    // 3. SimulateOrders route
    const simulateOrders = apiRoutes.addResource('SimulateOrders');
    simulateOrders.addMethod('POST', new apigateway.LambdaIntegration(lambdaFunction));

    // Create or use provided S3 bucket for web app hosting
    const bucketName = 'LovableInventoryApp';
    const websiteBucket = props.OriginBucket ?? new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: cdk.PhysicalName.GENERATE_IF_NEEDED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originPath: `/${props.OriginBasePath}`
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.RestApiOrigin(api),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        }
      },
      domainNames: props.CustomDomain ? [props.CustomDomain] : undefined,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        }
      ]
    });

    // Build and deploy React app to S3
    try {
      console.log('Building React app...');
      execSync('cd .. && npm run build', { stdio: 'inherit' });
      
      new s3deploy.BucketDeployment(this, 'DeployWebsite', {
        sources: [s3deploy.Source.asset('../dist')],
        destinationBucket: websiteBucket,
        destinationKeyPrefix: props.OriginBasePath,
        distribution,
        distributionPaths: ['/*'],
      });
    } catch (error) {
      console.error('Error building React app:', error);
    }

    // Output the CloudFront URL
    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL'
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });
  }
}

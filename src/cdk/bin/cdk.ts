
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AlgorithmicOrderSchedulerStack } from '../lib/algorithmic-order-scheduler-stack';

const app = new cdk.App();

// Deploy the stack with the provided name
new AlgorithmicOrderSchedulerStack(app, 'AlgorithmicOrderSchedulerStack', {
  // Optional custom domain can be passed here, e.g.:
  // CustomDomain: 'app.example.com',
  OriginBasePath: 'app-deployment'
});

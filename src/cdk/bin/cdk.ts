
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AlgorithmicOrderSchedulerStack } from '../lib/algorithmic-order-scheduler-stack';

const app = new cdk.App();

new AlgorithmicOrderSchedulerStack(app, 'AlgorithmicOrderSchedulerStack', {
  /* If you want to specify custom properties here, you can do so.
     For example:
     - CustomDomain: 'yourdomain.com'
     - OriginBasePath: 'app' */
  OriginBasePath: 'app'
});

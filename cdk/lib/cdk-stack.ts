import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import { CfnOutput } from '@aws-cdk/core';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3
    const bucket  = new s3.Bucket(this, "gsnFrontBucket", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // S3 output 
    new cdk.CfnOutput(this, "bucketName", {
      value: bucket.bucketName,
      description: 'GSN Audio File Input Web Site',
      exportName: 'gsnFrontBucket'
    });

    // Deployment
    new s3Deployment.BucketDeployment(this, "gsnDeploymentBucket", {
      sources: [s3Deployment.Source.asset("../build")],
      destinationBucket: bucket
    });

    // CloudFront
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'gsnDistribution', {
      originConfigs: [{
          s3OriginSource: {
            s3BucketSource: bucket},
          behaviors : [ {isDefaultBehavior: true}]
        }
      ]
    }); 

    // CloudFront URL
    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionDomainName,
      description: 'Cloudfront Domain NS, GSN Front Page ',
      exportName: 'gsnCloudFront'
    });

  }
}

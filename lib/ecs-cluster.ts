// here we set up an ECS cluster   
import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';
import * as logs from 'aws-cdk-lib/aws-logs';


export class EcsCluster extends cdk.Stack {
    private readonly vpc: ec2.Vpc;
    private readonly cluster: ecs.Cluster;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
    

        this.vpc = new ec2.Vpc(this, "MyVpc", {
            maxAzs: 3 // Default is all AZs in region
        });

        this.cluster = new ecs.Cluster(this, "MyCluster", {
            vpc: this.vpc
        });


        // Create Task Definition
        new ecs_patterns.ScheduledFargateTask(this, "ScheduledFargateTask", {
            cluster: this.cluster,
            scheduledFargateTaskImageOptions: {
                image: ecs.ContainerImage.fromRegistry("alpine/openssl"),
                memoryLimitMiB: 512,
                command: ["s_client", "-connect", "vimcar.de:443", "--servername", "vimcar.de", "|", "openssl", "x509", "-noout", "-dates"],
                logDriver: ecs.LogDrivers.awsLogs({
                    streamPrefix: id,
                    logRetention: logs.RetentionDays.ONE_DAY,
                }),
            },
            schedule: events.Schedule.cron({
                minute: '/1',
                hour: '*',
                day: '*',
                month: '*',
                year: '*',
            }),
            
        });

    }
}

# CloudFormation Provider for Amazon Connect

> _"You did WHAT?"_

<img src="https://raw.githubusercontent.com/iann0036/amazon-connect-cfn/master/screen.png" width="588" height="689" />

## Installation

<a href="https://console.aws.amazon.com/cloudformation/home?#/stacks/new?&templateURL=https://s3.amazonaws.com/ianmckay-ap-southeast-2/amazonconnectprovider/custom_resource.yaml" target="_blank"><img src="https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png"></a>

Click the above link to deploy the stack which is required to deploy the Transform and Custom Resource handler. This is required to be in place for any future stack deployments.

If you prefer, you can also manually upsert the [custom_resource.yaml](custom_resource.yaml) stack from source and compile your own copy of the Lambda source. Please note that if you do this, the NodeJS module requirements must be installed locally.


## Usage

Once the handler stack is created, you may use the below resources by adding the `AmazonConnectProvider` transform to your stack. This will transform your input template to convert the `AWS::Connect::*` resources into Custom Resources that will handle the lifecycle for that resource.

Check out the [example_stack.yaml](example_stack.yaml) file for a comprehensive example.


## Provided Resource Types

* [AWS::Connect::Instance](docs/AWS_Connect_Instance.md)
* [AWS::Connect::ContactFlow](docs/AWS_Connect_ContactFlow.md)
* [AWS::Connect::PhoneNumber](docs/AWS_Connect_PhoneNumber.md)


## How It Works

As Amazon Connect provides no native CloudFormation types and no exposed APIs for the management of its resources, this project uses [puppeteer](https://developers.google.com/web/tools/puppeteer/) within Lambda to perform the relevant actions using a browser.

The custom resource stack creates an IAM user that is given permissions to Amazon Connect and is additionally given a console login with a randomly generated password. An headless instance of Chrome is used to log in to the console and perform the required actions, both when creating and deleting resources.

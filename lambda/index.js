// npm i aws-sdk chrome-aws-lambda puppeteer-core request-promise

const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const AWS = require('aws-sdk');
const rp = require('request-promise');

const instanceInfo = {};

// Pupeteer Funcs
const { login, open, uploadResult } = require('./helpers/puppeteer');

// Phone Number CRUD Funcs
const { claimnumber, deletephonenumber } = require('./helpers/connect/routing/phoneNumber');

// Connect CRUD Funcs
const { createConnectInstance, deleteConnectInstance } = require('./helpers/connect/connectInstance');

// Contact Flow CRUD Funcs
const { createflow } = require('./helpers/connect/routing/contactFlow');

// Queue CRUD Funcs
const { createQueue, deleteQueue } = require('./helpers/connect/routing/queue');

// Routing Profile CRUD Funcs
const { createRoutingProfile } = require('./helpers/connect/users/routingProfile');

// Lexbot CRUD Funcs
const { createLexChatbot, deleteLexChatbot, createLexIntent, deleteLexIntent, createLexSlotType, deleteLexSlotType } = require('./helpers/lexbot');

exports.handler = async (event, context) => {
    let result = null;
    let browser = null;

    if (event.fragment) {
        let macro_response = {
            'requestId': event['requestId'],
            'status': 'success'
        };
        let response = event.fragment;

        macro_response['fragment'] = response;
        for (var k in response.Resources) {
            if (response.Resources[k]['Type'].startsWith('AWS::Connect::')) {
                if (!response.Resources[k]['Properties']) {
                    response.Resources[k]['Properties'] = {};
                }
                response.Resources[k]['Type'] = 'Custom::' + response.Resources[k]['Type'].replace(/\:\:/g, '_');
                response.Resources[k]['Properties']['ServiceToken'] = context.invokedFunctionArn;
            }
        }

        return macro_response;
    } else {
        var response_object = {
            "Status": "SUCCESS",
            "PhysicalResourceId": event.LogicalResourceId,
            "StackId": event.StackId,
            "RequestId": event.RequestId,
            "LogicalResourceId": event.LogicalResourceId,
            "Data": {}
        };

        try {
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: chromium.headless,
            });

            let page = await browser.newPage();

            // CREATE CONNECT INSTANCE
            if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_Instance") {
                response_object.Data = await createConnectInstance(event.ResourceProperties, instanceInfo);
            
            // CREATE CONTACT FLOW
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_ContactFlow") {
                await login(page);
                await open(page, event.ResourceProperties);
                response_object.Data = await createflow(page, event.ResourceProperties);

            // CREATE QUEUE
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_Queue") {
                await login(page);
                await open(page, event.ResourceProperties);
                response_object.Data = await createQueue(page, event.ResourceProperties);

            // CREATE ROUTING PROFILE
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_RoutingProfile") {
                response_object.Data = await createRoutingProfile(event.ResourceProperties);

            // CREATE PHONE NUMBER
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_PhoneNumber") {
                await login(page);
                await open(page, event.ResourceProperties);
                response_object.Data = await claimnumber(page, event.ResourceProperties);
                response_object.PhysicalResourceId = response_object.Data.PhoneNumber;
            
            // CREATE LEX CHATBOT
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_LexChatBot") {
                response_object.Data = await createLexChatbot(event.ResourceProperties);

            // CREATE LEX INTENT
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_LexIntent") {
                response_object.Data = await createLexIntent(event.ResourceProperties);

            // CREATE LEX SLOTTYPE
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_LexSlotType") {
                response_object.Data = await createLexSlotType(event.ResourceProperties);

            // UPDATE CONNECT INSTANCE
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_Instance") {
                await deleteConnectInstance(event.ResourceProperties);
                response_object.Data = await createConnectInstance(event.ResourceProperties, instanceInfo);

            // UPDATE CONTACT FLOW
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_ContactFlow") {
                await login(page);
                await open(page, event.ResourceProperties);
                response_object.Data = await createContactFlows(event.ResourceProperties);

            // UPDATE QUEUE
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_Queue") {
                await login(page);
                await open(page);
                await deleteQueue(page, event.ResourceProperties);
                response_object.Data = await createQueue(page, event.ResourceProperties);


            // UPDATE PHONE NUMBER
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_PhoneNumber") {
                await login(page);
                await open(page, event.ResourceProperties);
                await deletephonenumber(page, event.PhysicalResourceId);
                response_object.Data = await claimnumber(page, event.ResourceProperties);
                response_object.PhysicalResourceId = response_object.Data.PhoneNumber;

            // UPDATE LEX CHATBOT
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_LexChatBot") {
                response_object.Data = await updateLexChatbot(event.ResourceProperties);

            // UPDATE LEX INTENT
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_LexIntent") {
                response_object.Data = await updateLexIntent(event.ResourceProperties);

            // UPDATE LEX SLOTTYPE
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_LexSlotType") {
                response_object.Data = await updateLexSlotType(event.ResourceProperties);

            // DELETE CONNECT INSTANCE
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_Instance") {
                await deleteConnectInstance(event.ResourceProperties);

            // DELETE QUEUE
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_Queue") {
                await login(page);
                await open(page);
                await deleteQueue(page, event.ResourceProperties);

            // DELETE PHONE NUMBER
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_PhoneNumber") {
                await login(page);
                await open(page, event.ResourceProperties);
                await deletephonenumber(page, event.PhysicalResourceId);

            // DELETE CONTACT FLOW
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_ContactFlow") {
                // do nothing

            // DELETE LEX CHATBOT
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_LexChatBot") {
                await deleteLexChatbot(event.ResourceProperties);

            // DELETE LEX INTENT
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_LexIntent") {
                await deleteLexIntent(event.ResourceProperties);

            // DELETE LEX SLOTTYPE
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_LexSlotType") {
                await deleteLexSlotType(event.ResourceProperties);
            // default response
            } else {
                throw "Unknown action";
            }

            result = await page.url();
        } catch (error) {
            response_object.Status = "FAILED";
            response_object.Reason = error.message;
        } finally {
            if (browser !== null) {
                await browser.close();
            }

            console.log("About to upload result");
            console.log(response_object);
            await uploadResult(event.ResponseURL, response_object);
        }

        return context.succeed(result);
    }
};

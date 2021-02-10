const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const url = require('url');
var rp = require('request-promise');
const AWS = require('aws-sdk');

const connect = new AWS.Connect();
const { debugScreenshot } = require('../../puppeteer');
const { getInstanceId } = require('../connectInstance');

// Contact Flow Helper Funcs
function genParams(params) {
    const parameters = {};
    for(let p of params) {
        parameters[p.Name] = p.Value; 
    }
    return parameters;
}

function genAction(state) {
    console.debug('State:', JSON.stringify(state));

    const action = {};
    action.Identifier = state.Id;
    action.Type = state.Type;
    action.Transitions = {};
    action.Parameters = {};

    if (state.Parameters) {
        action.Parameters = genParams(state.Parameters);
    }
    if (state.Branches) {
        action.Transitions.NextAction = state.Branches.Destination;
        if (state.Branches.Errors) {
            action.Transitions.Errors = state.Branches.Errors;
        } else {
            action.Transitions.Errors = [];
        }
        if (state.Branches.Conditions) {
            action.Transitions.Conditions = state.Branches.Conditions;
        } else {
            action.Transitions.Conditions = [];
        }
    }
    return action;
}

function parseContent(properties) {

    // us raw JSON document if supplied, otherwise use parsed yaml
    if (properties.JSONContent) {
        return properties.JSONContent
    }

    if (properties.States) {
        console.debug('States', JSON.stringify(properties.States));
        const content = {};
        content.Version = "2019-10-30";
        content.StartAction = properties.States.filter(x => x.Start)[0].Id;
        content.Actions = properties.States.map(x => genAction(x));
        return JSON.stringify(content);
    }
}

// Contact Flow CRUD Funcs with Puppeteer
module.exports.createflow = async (page, properties) => {
    let host = 'https://' + new url.URL(await page.url()).host;
    console.log('HOST', host);
    console.log('PROPERTIES:', JSON.stringify(properties));
 
    let retries = 0;
    do {
        await page.goto(host + "/connect/contact-flows/create?type=contactFlow");
        await page.waitFor(5000);
        console.log("Checking for correct load");
        console.log(host + "/connect/contact-flows/create?type=contactFlow");
        retries++;
    } while ((await page.$('#angularContainer') === null) && retries < 5);
 
    await debugScreenshot(page, 'contact-flow');
 
    let dropdown = await page.$('#can-edit-contact-flow > div.cf-dropdown-btn.dropdown.awsui > awsui-button > button');
    console.debug('Dropdown', dropdown);
    await dropdown.click();
 
    await page.waitFor(200);
 
    await debugScreenshot(page, 'contactflow-dropdown');
 
    let importbutton = await page.$('#cf-dropdown > li:nth-child(2) > a');
    console.debug('ImportButton', importbutton);
    await importbutton.click();
 
    await page.waitFor(500);
 
    await debugScreenshot(page, 'import-clicked');
 
    await new Promise(function (resolve, reject) {
        var itemcount = 1;
        var startstate = properties.States[0].Id;
        properties.States.forEach(state => {
            if (state.Start) {
                startstate = state.Id;
            }
        });
 
        fs.writeFile("/tmp/flow.json", `{
    "modules": [${properties.States.map(state => `{
        "id": "${state.Id}",
        "type": "${state.Type}",
        "branches": [${state.Branches ? state.Branches.map(branch => `{
            "condition": "${branch.Condition}",
            "transition": "${branch.Destination}"
        }`).join(', ') : ''}],
        "parameters": [${state.Parameters ? state.Parameters.map(parameter => `{
            "name": "${parameter.Name}",
            "value": "${parameter.Value}"
        }`).join(', ') : ''}],
        "metadata": {
            "position": {
                "x": ${((300 * itemcount++) - 50)},
                "y": 17
            }
        }
    }`).join(', ')}],
    "version": "1",
    "type": "contactFlow",
    "start": "${startstate}",
    "metadata": {
        "entryPointPosition": {
            "x": 24,
            "y": 17
        },
        "snapToGrid": false,
        "name": "${properties.Name}",
        "description": "${properties.Description || ''}",
        "type": "contactFlow",
        "status": "saved"
    }
}`, function (err) {
            if (err) {
                return console.log(err);
            }
 
            console.log("The file was saved!");
            resolve();
        });
    });
 
    console.log('Ready to Upload File');
    let fileinput = await page.$('#import-cf-file');
    
    console.log('FILE', fileinput);
    await debugScreenshot(page, 'contactflow-file-imported');
    try {
        const res = await fileinput.uploadFile('/tmp/flow.json');
        console.debug('UPLOAD RES:', JSON.stringify(res));
    } catch(err) {
        console.error('COULD NOT UPLOAD', JSON.stringify(err));
        console.error('RAW', err);
    }
 
    await page.waitFor(5000);
 
    let doimport = await page.$('div.awsui-modal-__state-showing:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > span:nth-child(1) > div:nth-child(1) > awsui-button:nth-child(1)');
    console.debug('DoImport', doimport);
    await doimport.click();
 
    await page.waitFor(5000);
 
    await debugScreenshot(page, 'contactflow-before-save');
 
    await page.waitFor(200);
    console.log('SAVING');
    let savebutton = await page.$('#saveContactFlowButton');
    console.debug('SaveButton', savebutton);
    await savebutton.click();
    await page.waitFor(3000);
 
    await debugScreenshot(page, 'contactflow-after-save');
    let saveandpublishbutton = await page.$('#publishContactFlowButton');
    console.debug('SaveAndPublishButton', saveandpublishbutton);
    await saveandpublishbutton.click();
    await debugScreenshot(page, 'contactflow-save-and-publish');
    await page.waitFor(5000);

    let confirmPublish = await page.$('div.awsui-modal-__state-showing:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > span:nth-child(1) > div:nth-child(1) > awsui-button:nth-child(1)');
    console.debug('CLICK CONFIRM');
    console.debug('ConfirmPublishButton', confirmPublish);
    await debugScreenshot(page, 'contactflow-confirm-publish');
    try {
        await confirmPublish.click();
    } catch(err) {
        console.error('CONFIRM FAIL', err);
    }
    await page.waitFor(5000);
    await debugScreenshot(page, 'contactflow-done');
 
    return {
        'Name': properties.Name
    };
}

// Contact Flow CRUD Funcs with SDK
module.exports.createContactFlow = async (properties) => {
    const params = {
        Content: parseContent(properties),
        InstanceId: await getInstanceId(properties.ConnectInstance),
        Name: properties.Name,
        Type: properties.Type,
        Description: properties.Description
    };
    console.debug('CreateContactFlow Params', JSON.stringify(params));

    try {
        const res = await connect.createContactFlow(params).promise();
        console.debug('ContactFlow', JSON.stringify(res));
    } catch (err) {
        console.error('Failed to CreateContactFlow', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    return {
        Name: properties.Name
    };
}
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const url = require('url');
var rp = require('request-promise');

const { debugScreenshot } = require('../../puppeteer');

// Contact Flow CRUD Funcs
module.exports.createflow = async (page, properties) => {
    let host = 'https://' + new url.URL(await page.url()).host;
    console.log('HOST', host);
    console.log('PROPERTIES:', JSON.stringify(properties));
 
    do {
        await page.goto(host + "/connect/contact-flows/create?type=contactFlow");
        await page.waitFor(5000);
        console.log("Checking for correct load");
        console.log(host + "/connect/contact-flows/create?type=contactFlow");
    } while (await page.$('#angularContainer') === null);
 
    await debugScreenshot(page);
 
    let dropdown = await page.$('#can-edit-contact-flow > div.cf-dropdown-btn.dropdown.awsui > awsui-button > button');
    console.log(dropdown);
    await dropdown.click();
 
    await page.waitFor(200);
 
    await debugScreenshot(page);
 
    let importbutton = await page.$('#cf-dropdown > li:nth-child(2) > a');
    console.log(importbutton);
    await importbutton.click();
 
    await page.waitFor(500);
 
    await debugScreenshot(page);
 
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
    await debugScreenshot(page);
    try {
        const res = await fileinput.uploadFile('/tmp/flow.json');
        console.debug('UPLOAD RES:', JSON.stringify(res));
    } catch(err) {
        console.error('COULD NOT UPLOAD', JSON.stringify(err));
        console.error('RAW', err);
    }
 
    await page.waitFor(5000);
 
    let doimport = await page.$('div.awsui-modal-__state-showing:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > span:nth-child(1) > div:nth-child(1) > awsui-button:nth-child(1)');
    await doimport.click();
 
    await page.waitFor(5000);
 
    await debugScreenshot(page);
 
    await page.waitFor(200);
    console.log('SAVING');
    let savebutton = await page.$('#saveContactFlowButton');
    await savebutton.click();
    await page.waitFor(3000);
 
    await debugScreenshot(page);
    let saveandpublishbutton = await page.$('#publishContactFlowButton');
    await saveandpublishbutton.click();
    await debugScreenshot(page);
    await page.waitFor(5000);

    let confirmPublish = await page.$('div.awsui-modal-__state-showing:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > span:nth-child(1) > div:nth-child(1) > awsui-button:nth-child(1)');
    console.debug('CLICK CONFIRM');
    await debugScreenshot(page);
    try {
        await confirmPublish.click();
    } catch(err) {
        console.error('CONFIRM FAIL', err);
    }
    await page.waitFor(5000);
    await debugScreenshot(page);
 
    return {
        'Name': properties.Name
    };
}
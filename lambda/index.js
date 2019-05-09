// npm i aws-sdk chrome-aws-lambda puppeteer-core request-promise

const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const AWS = require('aws-sdk');
const fs = require('fs');
const url = require('url');
var rp = require('request-promise');

var s3 = new AWS.S3();

const uploadResult = async (url, data) => {
    await rp({ url: url, method: 'PUT', body: JSON.stringify(data) });
}

const uploadFile = (filePath, bucketName, key) => {
    fs.readFile(filePath, (err, data) => {
        if (err) console.error(err);

        var base64data = new Buffer(data, 'binary');

        var params = {
            Bucket: bucketName,
            Key: key,
            Body: base64data
        };

        s3.upload(params, (err, data) => {
            if (err) console.error(`Upload Error ${err}`);
            console.log('Upload Completed');
        });
    });
};

async function login(page) {
    var secretsmanager = new AWS.SecretsManager();
    var passwordstr = "";

    await new Promise(function (resolve, reject) {
        secretsmanager.getSecretValue({
            SecretId: process.env.CONNECT_PASSWORD_SECRET
        }, function (err, data) {
            if (err) {
                console.log(err, err.stack);
                reject();
            }

            passwordstr = JSON.parse(data.SecretString).password;
            resolve();
        });
    });

    await page.goto('https://' + process.env.ACCOUNTID + '.signin.aws.amazon.com/console');
    await page.screenshot({ path: '/tmp/screen1.png' });
    await uploadFile('/tmp/screen1.png', process.env.DEBUG_BUCKET, 'screen1.png');
    await page.waitFor(4000);

    let username = await page.$('#username');
    await username.press('Backspace');
    await username.type(process.env.CONNECT_USERNAME, { delay: 100 });

    let password = await page.$('#password');
    await password.press('Backspace');
    await password.type(passwordstr, { delay: 100 });

    let signin_button = await page.$('#signin_button');
    signin_button.click();

    await page.screenshot({ path: '/tmp/screen2.png' });
    uploadFile('/tmp/screen2.png', process.env.DEBUG_BUCKET, 'screen2.png');

    await page.waitFor(5000);
}

async function create(page, directoryname) {
    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com/connect/onboarding');
    await page.waitFor(5000);

    let directory = await page.$('input[ng-model="ad.directoryAlias"]');
    await directory.press('Backspace');
    await directory.type(directoryname, { delay: 100 });

    page.focus('button.awsui-button-variant-primary');
    let next1 = await page.$('button.awsui-button-variant-primary');
    next1.click();

    await page.waitFor(200);

    let skipradio = await page.$('label.vertical-padding.option-label:nth-child(3)');
    skipradio.click();

    await page.waitFor(200);

    let next2 = await page.$('button[type="submit"].awsui-button-variant-primary');
    next2.click();

    await page.waitFor(200);

    let next3 = await page.$('button[type="submit"].awsui-button-variant-primary');
    next3.click();

    await page.waitFor(200);

    let next4 = await page.$('button[type="submit"].awsui-button-variant-primary');
    next4.click();

    await page.waitFor(200);

    let next5 = await page.$('button[type="submit"].awsui-button-variant-primary');
    next5.click();

    await page.waitFor(200);

    let finish = await page.$('button[type="submit"].awsui-button-variant-primary');
    finish.click();

    await page.waitFor(180000);

    await page.screenshot({ path: '/tmp/screen25.png' });
    uploadFile('/tmp/screen25.png', process.env.DEBUG_BUCKET, 'screen25.png');

    await page.waitFor(3000);

    //await page.waitForXPath("//button[contains(text(), 'Get started')]", {timeout: 180000});
}

async function open(page, properties) {
    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com/connect/home');
    await page.waitFor(8000);

    await page.screenshot({ path: '/tmp/screen3.png' });
    uploadFile('/tmp/screen3.png', process.env.DEBUG_BUCKET, 'screen3.png');

    await page.waitFor(3000);

    let entry = await page.$('table > tbody > tr > td:nth-child(1) > div > a');
    await entry.click();

    await page.waitFor(5000);

    let loginbutton = await page.$('a[ng-show="org.organizationId"]');
    let loginlink = await page.evaluate((obj) => {
        return obj.getAttribute('href');
    }, loginbutton);

    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com' + loginlink);

    await page.waitFor(8000);

    await page.screenshot({ path: '/tmp/screen4.png' });
    uploadFile('/tmp/screen4.png', process.env.DEBUG_BUCKET, 'screen4.png');
}

async function claimnumber(page, properties) {
    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com/connect/numbers/claim');
    await page.waitFor(5000);

    await page.screenshot({ path: '/tmp/screen31.png' });
    uploadFile('/tmp/screen31.png', process.env.DEBUG_BUCKET, 'screen31.png');

    await page.waitFor(3000);

    let did = await page.$('li[heading="DID (Direct Inward Dialing)"] > a');
    await did.click();

    await page.waitFor(200);

    let ccinput = await page.$('div.active > span > div.country-code-real-input');
    await ccinput.click();

    await page.waitFor(200);

    let countryitem = await page.$('div.active > span.country-code-input.ng-scope > ul > li:nth-child(1)');
    await countryitem.click();

    await page.waitFor(5000);

    let phonenumberselection = await page.$('div.active > awsui-radio-group > div > span > div:nth-child(1) > awsui-radio-button > label.awsui-radio-button-wrapper-label > div');
    await phonenumberselection.click();
    let phonenumber = await page.$('div.active > awsui-radio-group > div > span > div:nth-child(1) > awsui-radio-button > label.awsui-radio-button-checked.awsui-radio-button-label > div > span > div');

    await page.waitFor(200);

    await page.screenshot({ path: '/tmp/screen4.png' });
    uploadFile('/tmp/screen4.png', process.env.DEBUG_BUCKET, 'screen4.png');

    let s2id = await page.$('#s2id_select-width > a');
    await s2id.click();
    await page.waitFor(2000);

    await page.screenshot({ path: '/tmp/screen32.png' });
    uploadFile('/tmp/screen32.png', process.env.DEBUG_BUCKET, 'screen32.png');
    await page.waitFor(4000);

    //#select2-drop > div > input
}

async function createflow(page, properties) {
    let host = 'https://' + new url.URL(await page.url()).host;

    await page.goto(host + "/connect/contact-flows/create?type=contactFlow");
    await page.waitFor(5000);

    await page.screenshot({ path: '/tmp/screen7.png' });
    uploadFile('/tmp/screen7.png', process.env.DEBUG_BUCKET, 'screen7.png');
    await page.waitFor(3000);

    let dropdown = await page.$('#can-edit-contact-flow > div > awsui-button > button');
    console.log(dropdown);
    await dropdown.click();

    await page.waitFor(200);

    await page.screenshot({ path: '/tmp/screen8.png' });
    uploadFile('/tmp/screen8.png', process.env.DEBUG_BUCKET, 'screen8.png');

    let importbutton = await page.$('li[ng-if="cfImportExport"]');
    console.log(importbutton);
    await importbutton.click();

    await page.waitFor(500);

    await page.screenshot({ path: '/tmp/screen9.png' });
    uploadFile('/tmp/screen9.png', process.env.DEBUG_BUCKET, 'screen9.png');

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

    let fileinput = await page.$('#import-cf-file');
    console.log(fileinput);
    await fileinput.uploadFile('/tmp/flow.json');

    await page.waitFor(5000);

    let doimport = await page.$('awsui-button[text="Import"] > button');
    await doimport.click();

    await page.waitFor(5000);

    await page.screenshot({ path: '/tmp/screen10.png' });
    uploadFile('/tmp/screen10.png', process.env.DEBUG_BUCKET, 'screen10.png');

    await dropdown.click();
    await page.waitFor(200);

    let savebutton = await page.$('#cf-dropdown > li:nth-child(1) > a');
    await savebutton.click();
    await page.waitFor(200);

    let saveandpublishbutton = await page.$('awsui-button[text="Save & publish"] > button');
    await saveandpublishbutton.click();

    await page.waitFor(5000);

    await page.screenshot({ path: '/tmp/screen11.png' });
    uploadFile('/tmp/screen11.png', process.env.DEBUG_BUCKET, 'screen11.png');
}

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

            if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_Instance") {
                await login(page);
                await create(page, event.ResourceProperties.Domain);
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_ContactFlow") {
                await login(page);
                await open(page, event.ResourceProperties);
                await createflow(page, event.ResourceProperties);
            } else if (event.RequestType == "Delete") {
                ;
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
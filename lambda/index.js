// npm i aws-sdk chrome-aws-lambda puppeteer-core request-promise

const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const AWS = require('aws-sdk');
const fs = require('fs');
const url = require('url');
var rp = require('request-promise');

var s3 = new AWS.S3();
const connect = new AWS.Connect();
const instanceInfo = {};

const uploadResult = async (url, data) => {
    await rp({ url: url, method: 'PUT', body: JSON.stringify(data) });
}

const debugScreenshot = async (page) => {
    let filename = Date.now().toString() + ".png";

    await page.screenshot({ path: '/tmp/' + filename });

    await new Promise(function (resolve, reject) {
        fs.readFile('/tmp/' + filename, (err, data) => {
            if (err) console.error(err);

            var base64data = new Buffer(data, 'binary');

            var params = {
                Bucket: process.env.DEBUG_BUCKET,
                Key: filename,
                Body: base64data
            };

            s3.upload(params, (err, data) => {
                if (err) console.error(`Upload Error ${err}`);
                console.log('Upload Completed');
                resolve();
            });
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
    await debugScreenshot(page);

    let username = await page.$('#username');
    await username.press('Backspace');
    await username.type(process.env.CONNECT_USERNAME, { delay: 100 });

    let password = await page.$('#password');
    await password.press('Backspace');
    await password.type(passwordstr, { delay: 100 });

    let signin_button = await page.$('#signin_button');
    signin_button.click();

    await debugScreenshot(page);

    await page.waitFor(5000);
}

async function createinstance(page, properties) {
    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com/connect/onboarding');
    await page.waitFor(5000);

    let directory = await page.$('input[ng-model="ad.directoryAlias"]');
    await directory.press('Backspace');
    await directory.type(properties.Domain, { delay: 100 });

    page.focus('button.awsui-button-variant-primary');
    let next1 = await page.$('button.awsui-button-variant-primary');
    next1.click();

    await page.waitForSelector('label.vertical-padding.option-label');
    await page.waitFor(200);
    let skipradio = await page.$$('label.vertical-padding.option-label');
    skipradio.pop().click();

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

    await page.waitForSelector('div.launch-page-login-link', { timeout: 180000 });

    await debugScreenshot(page);

    await page.waitFor(120000);

    return {
        'Domain': properties.Domain
    };
}

async function open(page, properties) {
    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com/connect/home');
    await page.waitFor(8000);

    await debugScreenshot(page);

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

    await debugScreenshot(page);
}

/*async function deleteinstance(page, properties) {
    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com/connect/home');
    await page.waitFor(8000);

    await debugScreenshot(page);

    await page.waitFor(3000);

    let checkbox = await page.$$('awsui-checkbox > label > input');
    let cells = await page.$$('td > div.ellipsis-overflow.ng-scope');
    for (var cell in cells) {
        await page.evaluate((obj, domain) => {
            console.log(obj);
            if (obj.textContent.trim() == domain) {
                obj.childNodes[1].firstChild.firstChild.click();
            }
        }, cells[cell], properties.Domain);
    }

    await page.waitFor(200);
    await debugScreenshot(page);

    console.log("Clicked checkbox");

    let removebutton = await page.$$('button[type="submit"]');
    await removebutton[1].click();
    console.log("Clicked remove");
    await page.waitFor(200);

    await debugScreenshot(page);
    let directory = await page.$('input.awsui-textfield');
    await directory.press('Backspace');
    await directory.type(properties.Domain, { delay: 100 });
    await page.waitFor(200);

    let confirm = await page.$('awsui-button[click="confirmDeleteOrg()"] > button');
    await confirm.click();
    await page.waitFor(5000);

    await debugScreenshot(page);
}*/

async function deletephonenumber(page, phonenumber) {
    let host = 'https://' + new url.URL(await page.url()).host;

    await page.goto(host + '/connect/numbers');
    await page.waitFor(8000);

    await debugScreenshot(page);

    let directory = await page.$('#search-bar');
    await directory.press('Backspace');
    await directory.type(phonenumber.replace(/ /g, ''), { delay: 100 }); // apparently, spaces are bad?
    await page.waitFor(2000);

    await debugScreenshot(page);
    console.log("Checkbox");

    let checkbox = await page.$('awsui-checkbox[ng-model="number.selected"] > label');
    await checkbox.click();
    await page.waitFor(2000);

    await debugScreenshot(page);
    console.log("Release");

    let releasebutton = await page.$('awsui-button[text="Release"] > button');
    await releasebutton.click();
    await page.waitFor(2000);

    await debugScreenshot(page);
    console.log("Remove");

    let removebutton = await page.$('awsui-button[text="Remove"] > button');
    await removebutton.click();
    await page.waitFor(2000);

    await debugScreenshot(page);
}

async function claimnumber(page, properties) {
    console.debug('PROPERTIES', JSON.stringify(properties));
    let host = 'https://' + new url.URL(await page.url()).host;

    console.log(host + '/connect/numbers/claim');

    await page.goto(host + '/connect/numbers/claim');
    await page.waitFor(5000);

    await debugScreenshot(page);

    await page.waitFor(3000);

    let did = await page.$('li[heading="DID (Direct Inward Dialing)"] > a');
    console.debug('CLICK DID Button');
    try {
        await did.click();
    } catch(err) {
        console.error('DID FAILED', err);
    }

    await page.waitFor(200);

    let ccinput = await page.$('div.active > span > div.country-code-real-input');
    console.debug('CLICK CCINPUT');
    try {
        await ccinput.click();
    } catch(err) {
        console.error('CCINPUT FAILED', err);
    }

    await page.waitFor(200);
                                   
    let countryitem = await page.$('div.active > span.country-code-input.ng-scope > ul > li:last-child');
    
    console.debug('CLICK COUNTRY ITEM');
    try {
        await countryitem.click();
    } catch(err) {
        console.error('COUNTRYITEM Failed', err);
    }

    await page.waitFor(5000);
    let phonenumberselection = await page.$('div.tab-pane:nth-child(2) > awsui-radio-group:nth-child(3) > div:nth-child(1) > span:nth-child(1) > div:nth-child(1) > awsui-radio-button:nth-child(1) > label:nth-child(1) > div:nth-child(2)');

    console.debug('CLICK PHONENUMBER');
    await debugScreenshot(page);
    try {
        await phonenumberselection.click();
    } catch(err) {
        console.error('PHONENUMBER Failed', err);
    }  
    await debugScreenshot(page);
    let phonenumber = await page.$('.awsui-radio-button-checked > div:nth-child(1) > span:nth-child(1) > div:nth-child(1)');
    console.debug('PhoneNumber:', phonenumber);
    let phonenumbertext = await page.evaluate(el => el.textContent, phonenumber);

    await page.waitFor(1000);

    await debugScreenshot(page);

    let s2id = await page.$('#s2id_select-width > a');
    console.debug('CLICK s2id');
    try {
        await s2id.click();
    } catch(err) {
        console.error('s2id Failed', err);
    }
    await page.waitFor(2000);

    await debugScreenshot(page);

    let s2input = await page.$('#select2-drop > div > input');
    await s2input.press('Backspace');
    await s2input.type(properties.ContactFlow, { delay: 100 });
    await page.waitFor(2000);
    await s2input.press('Enter');
    await page.waitFor(1000);

    await debugScreenshot(page);

    let savenumber = await page.$('awsui-button.table-bottom-left-button:nth-child(10)');
    console.debug('CLICK SAVENUMBER');
    try {
        await savenumber.click();
    } catch(err) {
        console.error('SAVENUMBER Failed', err);
    }
    await page.waitFor(5000);

    await debugScreenshot(page);

    return {
        'PhoneNumber': phonenumbertext
    };
}

async function createConnectInstance(properties) {
    const params = {
        IdentityManagementType: 'CONNECT_MANAGED',
        InboundCallsEnabled: true,
        OutboundCallsEnabled: true,
        InstanceAlias: properties.Domain
    };
    console.debug('CREATE PARAMS', JSON.stringify(params));
    try {
        const instanceRes = await connect.createInstance(params).promise();
        if(instanceRes.err) {
            console.error('CreateInstance Failed', JSON.stringify(instanceRes.err));
            console.error('RAW', instanceRes.err);
        }
        console.debug('instanceRes', JSON.stringify(instanceRes));
        instanceInfo.instanceId = instanceRes.Id;
    } catch (err) {
        console.error('CreateInstance Failed', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    return {
        'Domain': properties.Domain
    };
}

async function deleteConnectInstance(properties) {
    let toDelete;
    try {
        const instances = await connect.listInstances({}).promise();
        console.debug('INSTANCES', JSON.stringify(instances));
        if(instances.err) {
            console.error('ListInstances Failed', JSON.stringify(err));
            console.error('RAW', err);
        }
        toDelete = instances.InstanceSummaryList.filter(x => x.InstanceAlias === properties.Domain)[0];
    } catch(err) {
        console.error('ListInstances Failed', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    try {
        const params = {
            InstanceId: toDelete.Id
        };
        console.debug('DELETION PARAMS', JSON.stringify(params));
        await connect.deleteInstance(params).promise();
    } catch(err) {
        console.error('DeleteInstance Failed', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
}

async function createflow(page, properties) {
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
                response_object.Data = await createinstance(page, event.ResourceProperties);
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_ContactFlow") {
                await login(page);
                await open(page, event.ResourceProperties);
                response_object.Data = await createflow(page, event.ResourceProperties);
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_PhoneNumber") {
                await login(page);
                await open(page, event.ResourceProperties);
                response_object.Data = await claimnumber(page, event.ResourceProperties);
                response_object.PhysicalResourceId = response_object.Data.PhoneNumber;
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_Instance") {

                await deleteConnectInstance(event.ResourceProperties);
                response_object.Data = await createinstance(event.ResourceProperties);
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_ContactFlow") {
                await login(page);
                await open(page, event.ResourceProperties);
                response_object.Data = await createContactFlows(event.ResourceProperties);
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_PhoneNumber") {
                await login(page);
                await open(page, event.ResourceProperties);
                await deletephonenumber(page, event.PhysicalResourceId);
                response_object.Data = await claimnumber(page, event.ResourceProperties);
                response_object.PhysicalResourceId = response_object.Data.PhoneNumber;
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_Instance") {

                await deleteConnectInstance(event.ResourceProperties);
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_PhoneNumber") {
                await login(page);
                await open(page, event.ResourceProperties);
                await deletephonenumber(page, event.PhysicalResourceId);
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_ContactFlow") {
                ; // do nothing
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

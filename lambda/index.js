const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const AWS = require('aws-sdk');
const fs = require('fs');
const url = require('url');

var s3 = new AWS.S3();

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
    await page.goto('https://' + process.env.ACCOUNTID + '.signin.aws.amazon.com/console');
    await page.screenshot({ path: '/tmp/screen1.png' });
    await uploadFile('/tmp/screen1.png', process.env.DEBUG_BUCKET, 'screen1.png');
    await page.waitFor(4000);

    const username = await page.$('#username');
    await username.press('Backspace');
    await username.type(process.env.CONNECT_USERNAME, { delay: 100 });

    const password = await page.$('#password');
    await password.press('Backspace');
    await password.type(process.env.CONNECT_PASSWORD, { delay: 100 });

    const signin_button = await page.$('#signin_button');
    signin_button.click();

    await page.screenshot({ path: '/tmp/screen2.png' });
    uploadFile('/tmp/screen2.png', process.env.DEBUG_BUCKET, 'screen2.png');

    await page.waitFor(5000);
}

async function create(page, directoryname) {
    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com/connect/onboarding');
    await page.waitFor(3000);

    const directory = await page.$('table.onboarding-table > tbody > tr > td:nth-child(2) > input');
    await directory.press('Backspace');
    await directory.type(directorynamedirectoryname, { delay: 100 });

    page.focus('button.awsui-button-variant-primary');
    const next1 = await page.$('button.awsui-button-variant-primary');
    next1.click();

    await page.waitFor(200);

    const skipradio = await page.$('div.onboarding-main-pane > div > label:nth-child(7) > input');
    skipradio.click();

    const next2 = await page.$('button[type="submit"].awsui-button-variant-primary');
    next2.click();

    await page.waitFor(200);

    const next3 = await page.$('button[type="submit"].awsui-button-variant-primary');
    next3.click();

    await page.waitFor(200);

    const next4 = await page.$('button[type="submit"].awsui-button-variant-primary');
    next4.click();

    await page.waitFor(200);

    const next5 = await page.$('button[type="submit"].awsui-button-variant-primary');
    next5.click();

    await page.waitFor(200);

    const finish = await page.$('button[type="submit"].awsui-button-variant-primary');
    finish.click();

    await page.waitFor(180000);

    //await page.waitForXPath("//button[contains(text(), 'Get started')]", {timeout: 180000});
}

async function open(page) {
    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com/connect/home');
    await page.waitFor(8000);

    await page.screenshot({ path: '/tmp/screen3.png' });
    uploadFile('/tmp/screen3.png', process.env.DEBUG_BUCKET, 'screen3.png');

    await page.waitFor(3000);

    const entry = await page.$('table > tbody > tr > td:nth-child(1) > div > a');
    console.log(entry);
    await entry.click();

    await page.waitFor(5000);

    const loginbutton = await page.$('a[ng-show="org.organizationId"]');
    const loginlink = await page.evaluate((obj) => {
        return obj.getAttribute('href');
    }, loginbutton);
    console.log('https://' + process.env.AWS_REGION + '.console.aws.amazon.com' + loginlink);

    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com' + loginlink);

    await page.waitFor(8000);

    await page.screenshot({ path: '/tmp/screen4.png' });
    uploadFile('/tmp/screen4.png', process.env.DEBUG_BUCKET, 'screen4.png');
}

async function createflow(page) {
    const host = 'https://' + new url.URL(await page.url()).host;

    await page.goto(host + "/connect/contact-flows/create?type=contactFlow");
    await page.waitFor(5000);

    await page.screenshot({ path: '/tmp/screen7.png' });
    uploadFile('/tmp/screen7.png', process.env.DEBUG_BUCKET, 'screen7.png');
    await page.waitFor(3000);

    const dropdown = await page.$('#can-edit-contact-flow > div > awsui-button > button');
    console.log(dropdown);
    await dropdown.click();

    await page.waitFor(200);

    await page.screenshot({ path: '/tmp/screen8.png' });
    uploadFile('/tmp/screen8.png', process.env.DEBUG_BUCKET, 'screen8.png');

    const importbutton = await page.$('li[ng-if="cfImportExport"]');
    console.log(importbutton);
    await importbutton.click();

    await page.waitFor(500);

    await page.screenshot({ path: '/tmp/screen9.png' });
    uploadFile('/tmp/screen9.png', process.env.DEBUG_BUCKET, 'screen9.png');

    await new Promise(function (resolve, reject) {
        fs.writeFile("/tmp/flow.json", `{
    "modules": [{
        "id": "525772d6-d82a-4636-bfba-e6c6778da7b4",
        "type": "Disconnect",
        "branches": [],
        "parameters": [],
        "metadata": {
            "position": {
                "x": 514,
                "y": 66
            }
        }
    }, {
        "id": "e7a5c32f-d0de-4236-9a85-8629edf5d1e1",
        "type": "PlayPrompt",
        "branches": [{
            "condition": "Success",
            "transition": "525772d6-d82a-4636-bfba-e6c6778da7b4"
        }],
        "parameters": [{
            "name": "Text",
            "value": "Hello to you",
            "namespace": null
        }, {
            "name": "TextToSpeechType",
            "value": "text"
        }],
        "metadata": {
            "position": {
                "x": 186,
                "y": 54
            },
            "useDynamic": false
        }
    }],
    "version": "1",
    "type": "contactFlow",
    "start": "e7a5c32f-d0de-4236-9a85-8629edf5d1e1",
    "metadata": {
        "entryPointPosition": {
            "x": 24,
            "y": 17
        },
        "snapToGrid": false,
        "name": "MyCustomFlow",
        "description": null,
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

    const fileinput = await page.$('#import-cf-file');
    console.log(fileinput);
    await fileinput.uploadFile('/tmp/flow.json');

    await page.waitFor(5000);

    const doimport = await page.$('awsui-button[text="Import"] > button');
    console.log(doimport);
    await doimport.click();

    await page.waitFor(5000);

    await page.screenshot({ path: '/tmp/screen10.png' });
    uploadFile('/tmp/screen10.png', process.env.DEBUG_BUCKET, 'screen10.png');

    const savebutton = await page.$('button.lily-save-resource-button');
    console.log(savebutton);
    await savebutton.click();

    await page.waitFor(5000);

    await page.screenshot({ path: '/tmp/screen11.png' });
    uploadFile('/tmp/screen11.png', process.env.DEBUG_BUCKET, 'screen11.png');

}

exports.handler = async (event, context) => {
    let result = null;
    let browser = null;

    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        let page = await browser.newPage();

        await login(page);
        //create(page, 'exampledomain');
        await open(page);
        await createflow(page);

        await page.waitFor(5000);

        result = await page.url();
    } catch (error) {
        return context.fail(error);
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }

    return context.succeed(result);
};
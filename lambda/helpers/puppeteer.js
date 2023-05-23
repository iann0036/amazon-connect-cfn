const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const AWS = require('aws-sdk');
const fs = require('fs');
const url = require('url');
const rp = require('request-promise');
const { sign } = require('crypto');

const s3 = new AWS.S3();

// Debug Funcs
module.exports.uploadResult = async (url, data) => {
    await rp({ url: url, method: 'PUT', body: JSON.stringify(data) });
}

module.exports.debugScreenshot = async (page, name) => {
    let filename = name + '_' + Date.now().toString() + ".png";

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

// Pupeteer Funcs
module.exports.login = async (page) => {
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
    await module.exports.debugScreenshot(page, 'before-signin');

    let username = await page.$('#username');
    await username.press('Backspace');
    await username.type(process.env.CONNECT_USERNAME, { delay: 100 });

    let password = await page.$('#password');
    await password.press('Backspace');
    await password.type(passwordstr, { delay: 100 });

    let signin_button = await page.$('#signin_button');
    console.debug('SignIn', signin_button);
    signin_button.click();

    await module.exports.debugScreenshot(page, 'after-signin');

    await page.waitFor(5000);
}

module.exports.open = async (page, properties) => {
    await page.waitFor(60000);
    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com/connect/home');
    await page.waitFor(60000);

    await module.exports.debugScreenshot(page, 'connect-home');

    await page.waitFor(30000);

    let anchors = await page.$x('//*/table/tbody/tr/td/div/a');
    let entry;
    for(let i = 0; i < anchors.length; i++) {
        let el = anchors[i];
        let txt = await page.evaluate(el => el.textContent.trim(), el);
        console.debug('Anchor Text:', txt);
        console.debug(`${txt} - ${properties.ConnectInstance}`);
        if(txt === properties.ConnectInstance) {
            entry = el;
        }
    }
    
    console.debug('Entry', entry);
    await entry.click();
    await page.waitFor(5000);
    await module.exports.debugScreenshot(page, 'instance-selected');

    let retries = 0;
    do {
        await page.waitFor(5000);
        console.debug("Checking for correct load...");
        retries++;
    } while ((await page.$('a[ng-show="org.organizationId"]') === null) && retries < 5);

    let loginbutton = await page.$('a[ng-show="org.organizationId"]');
    let loginlink = await page.evaluate((obj) => {
        return obj.getAttribute('href');
    }, loginbutton);

    await page.goto('https://' + process.env.AWS_REGION + '.console.aws.amazon.com' + loginlink);

    await page.waitFor(8000);

    await module.exports.debugScreenshot(page, 'instance-login');
}
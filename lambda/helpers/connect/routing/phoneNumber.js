const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const url = require('url');
const rp = require('request-promise');

const { debugScreenshot } = require('../../puppeteer');

// Phone Number CRUD Funcs
module.exports.deletephonenumber = async (page, phonenumber) => {
    let host = 'https://' + new url.URL(await page.url()).host;

    await page.goto(host + '/connect/numbers');
    await page.waitFor(8000);

    await debugScreenshot(page, 'phonenumber-start');

    let directory = await page.$('#search-bar');
    await directory.press('Backspace');
    await directory.type(phonenumber.replace(/ /g, ''), { delay: 100 }); // apparently, spaces are bad?
    await page.waitFor(2000);

    await debugScreenshot(page, 'phonenumber-search');
    console.log("Checkbox");

    let checkbox = await page.$('awsui-checkbox[ng-model="number.selected"] > label');
    console.debug('Checkbox', checkbox);
    await checkbox.click();
    await page.waitFor(2000);

    await debugScreenshot(page, 'phonenumber-checkbox');
    console.log("Release");

    let releasebutton = await page.$('awsui-button[text="Release"] > button');
    console.debug('ReleaseButton', releasebutton);
    await releasebutton.click();
    await page.waitFor(2000);

    await debugScreenshot(page, 'phonenumber-release-button');
    console.log("Remove");

    let removebutton = await page.$('awsui-button[text="Remove"] > button');
    console.debug('RemoveButton', removebutton);
    await removebutton.click();
    await page.waitFor(2000);

    await debugScreenshot(page, 'phonenumber-remove-button');
}

module.exports.claimnumber = async (page, properties) => {
    console.debug('PROPERTIES', JSON.stringify(properties));
    let host = 'https://' + new url.URL(await page.url()).host;

    console.log(host + '/connect/numbers/claim');

    await page.goto(host + '/connect/numbers/claim');
    await page.waitFor(5000);

    await debugScreenshot(page, 'phonenumber-claim');

    await page.waitFor(3000);

    let did = await page.$('li[heading="DID (Direct Inward Dialing)"] > a');
    console.debug('CLICK DID Button', did);
    try {
        await did.click();
    } catch(err) {
        console.error('DID FAILED', err);
    }

    await page.waitFor(200);

    let ccinput = await page.$('div.active > span > div.country-code-real-input');
    console.debug('CLICK CCINPUT', ccinput);
    try {
        await ccinput.click();
    } catch(err) {
        console.error('CCINPUT FAILED', err);
    }

    await page.waitFor(200);
                                   
    let countryitem = await page.$('div.active > span.country-code-input.ng-scope > ul > li:last-child');
    
    console.debug('CLICK COUNTRY ITEM', countryitem);
    try {
        await countryitem.click();
    } catch(err) {
        console.error('COUNTRYITEM Failed', err);
    }

    await page.waitFor(5000);
    let phonenumberselection = await page.$('div.tab-pane:nth-child(2) > awsui-radio-group:nth-child(3) > div:nth-child(1) > span:nth-child(1) > div:nth-child(1) > awsui-radio-button:nth-child(1) > label:nth-child(1) > div:nth-child(2)');

    console.debug('CLICK PHONENUMBER', phonenumberselection);
    await debugScreenshot(page, 'phonenumber-selection');
    try {
        await phonenumberselection.click();
    } catch(err) {
        console.error('PHONENUMBER Failed', err);
    }  
    await debugScreenshot(page, 'phonenumber-selected');
    let phonenumber = await page.$('.awsui-radio-button-checked > div:nth-child(1) > span:nth-child(1) > div:nth-child(1)');
    console.debug('PhoneNumber:', phonenumber);
    let phonenumbertext = await page.evaluate(el => el.textContent, phonenumber);

    await page.waitFor(1000);

    await debugScreenshot(page, 'phonenumber-s2id');

    let s2id = await page.$('#s2id_select-width > a');
    console.debug('CLICK s2id', s2id);
    try {
        await s2id.click();
    } catch(err) {
        console.error('s2id Failed', err);
    }
    await page.waitFor(2000);

    await debugScreenshot(page, 'phonenumber-after-s2id');

    let s2input = await page.$('#select2-drop > div > input');
    await s2input.press('Backspace');
    await s2input.type(properties.ContactFlow, { delay: 100 });
    await page.waitFor(2000);
    await s2input.press('Enter');
    await page.waitFor(1000);

    await debugScreenshot(page, 'phonenumber-s2id-input');

    let savenumber = await page.$('awsui-button.table-bottom-left-button:nth-child(10)');
    console.debug('CLICK SAVENUMBER', savenumber);
    try {
        await savenumber.click();
    } catch(err) {
        console.error('SAVENUMBER Failed', err);
    }
    await page.waitFor(5000);

    await debugScreenshot(page, 'phonenumber-done');

    return {
        'PhoneNumber': phonenumbertext
    };
}
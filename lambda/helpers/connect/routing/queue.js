const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const url = require('url');
const rp = require('request-promise');

const { debugScreenshot, uploadResult, login, open } = require('../../puppeteer');

// Queue CRUD Funcs
module.exports.createQueue = async (page, properties) => {
    console.debug('PROPERTIES', JSON.stringify(properties));
    let host = 'https://' + new url.URL(await page.url()).host;

    console.log(host + '/connect/queues');

    await page.goto(host + '/connect/queues');
    await page.waitFor(5000);

    await debugScreenshot(page);

    await page.waitFor(3000);

    let newQueue = page.$('#angularContainer > div.table-top-bar.queues-filter-container > awsui-button > a');
    console.debug('CLICK NEW QUEUE BUTTON');

    try {
        await newQueue.click();
    } catch (err) {
        console.error('Failed to click NewQueue Button', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    let queueName = await page.$('#angularContainer > div.queue-main-content > div:nth-child(1) > div > div:nth-child(1) > div > input');
    try {
        await queueName.press('Backspace');
        await queueName.type(properties.QueueName, { delay: 100 });
        await page.waitFor(2000);
        await queueName.press('Enter');
        await page.waitFor(1000);
    } catch (err) {
        console.error('Failed to Write QueueName', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    let description = await page.$('#search-desc-input');
    try {
        await description.press('Backspace');
        await description.type(properties.Description, { delay: 100 });
        await page.waitFor(2000);
        await description.press('Enter');
        await page.waitFor(1000);
    } catch (err) {
        console.error('Failed to Write Description', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    let hrsOfOp = await page.$('#s2id_autogen1 > a');
    try {
        await hrsOfOp.press('Backspace');
        await hrsOfOp.type(properties.HoursOfOperation, { delay: 100 });
        await page.waitFor(2000);
        await hrsOfOp.press('Enter');
        await page.waitFor(1000);
    } catch (err) {
        console.error('Failed to Write HoursOfOperation', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    let outbndCallId = await page.$('#angularContainer > div.queue-main-content > div:nth-child(2) > div:nth-child(3) > input.inline-edit-input.c-m-12.queue-control-input-text.queue-callback-display-container.ng-pristine.ng-valid');
    try {
        await outbndCallId.press('Backspace');
        await outbndCallId.type(properties.OutboundCallerIDName, { delay: 100 });
        await page.waitFor(2000);
        await outbndCallId.press('Enter');
        await page.waitFor(1000);
    } catch (err) {
        console.error('Failed to Write OutboundCallerID', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    let outBndCallIdNumBtn = await page.$('#s2id_autogen3 > a');
    try {
        await outBndCallIdNumBtn.click();
    } catch (err) {
        console.error('Failed to click OutBoundCallerIDNumber Button', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    let outBndCallIdNumInput = await page.$('#select2-drop > div > input');
    try {
        await outBndCallIdNumInput.click();
    } catch (err) {
        console.error('Failed to click OutboundCallerIDNumber Input', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    let outBndCallIdNum = await page.$('#select2-drop > ul > li');
    try {
        await outBndCallIdNum.press('Backspace');
        await outBndCallIdNum.type(properties.OutboundCallerIDNumber, { delay: 100 });
        await page.waitFor(2000);
        await outBndCallIdNum.press('Enter');
        await page.waitFor(1000);
    } catch (err) {
        console.error('Failed to Write OutboundCallerID', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    let outBndWsprFlwBtn = await page.$('#s2id_autogen5 > a');
    try {
        await outBndWsprFlwBtn.click();
    } catch (err) {
        console.error('Failed to click OutboundWhisperFlow Button', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    let outBndWsprFlwInput = await page.$('#select2-drop > div > input');
    try {
        await outBndWsprFlwInput.click();
    } catch (err) {
        console.error('Failed to click OutboundWhisperFlow Input', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    if(properties.OutboundWhisperFlow) {
        let outBndWsprFlw = await page.$('#select2-drop > ul > li');
        try {
            await outBndWsprFlw.press('Backspace');
            await outBndWsprFlw.type(properties.OutboundWhisperFlow, { delay: 100 });
            await page.waitFor(2000);
            await outBndWsprFlw.press('Enter');
            await page.waitFor(1000);
        } catch (err) {
            console.error('Failed to Write OutboundCallerID', JSON.stringify(err));
            console.error('RAW', err);
            return err;
        }
    }

    if(properties.MaximumContactsInQueue) {
        let setLimit = await page.$('#awsui-checkbox-0');
        try {
            await setLimit.click();
        } catch (err) {
            console.error('Failed to click SetLimit Button', JSON.stringify(err));
            console.error('RAW', err);
            return err;
        }

        let setLimitInput = await page.$('#lily-admin-queue-set-limit-input');
        try {
            await setLimitInput.press('Backspace');
            await setLimitInput.type(properties.MaximumContactsInQueue, { delay: 100 });
            await page.waitFor(2000);
            await setLimitInput.press('Enter');
            await page.waitFor(1000);
        } catch (err) {
            console.error('Failed to Write MaximumContactsInQueue', JSON.stringify(err));
            console.error('RAW', err);
            return err;
        }
    }

    if(properties.QuickConnects) {
        let quickConInput = await page.$('#s2id_autogen8');
        await quickConInput.press('Backspace');
        for(const qc of properties.QuickConnects) {
            try {
                await quickConInput.type(qc, { delay: 100 });
                await page.waitFor(2000);
                await quickConInput.press('Enter');
                await page.waitFor(1000);
            } catch (err) {
                console.error('Failed to Write MaximumContactsInQueue', JSON.stringify(err));
                console.error('RAW', err);
                return err;
            }
        }
    }

}

module.exports.deleteQueue = async (page, properties) => {

}
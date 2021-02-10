const url = require('url');
const rp = require('request-promise');
const AWS = require('aws-sdk');

const connect = new AWS.Connect();
const { debugScreenshot } = require('../../puppeteer');
const { getInstanceId } = require('../connectInstance');
const { getHoursOfOperationId } = require('../routing/hoursOfOp');

// Queue CRUD Funcs utilizing Puppeteer
module.exports.createqueue = async (page, properties) => {
    console.debug('PROPERTIES', JSON.stringify(properties));
    let host = 'https://' + new url.URL(await page.url()).host;

    console.log(host + '/connect/queues');

    await page.goto(host + '/connect/queues');
    await page.waitFor(5000);

    await debugScreenshot(page, 'queues-start');

    await page.waitFor(3000);

    let newQueue = page.$('#angularContainer > div.table-top-bar.queues-filter-container > awsui-button > a');
    console.debug('CLICK NEW QUEUE BUTTON', newQueue);

    try {
        await newQueue.click();
    } catch (err) {
        console.error('Failed to click NewQueue Button', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    await debugScreenshot(page, 'queues-new');

    let queueName = await page.$('#angularContainer > div.queue-main-content > div:nth-child(1) > div > div:nth-child(1) > div > input');
    try {
        await queueName.press('Backspace');
        await queueName.type(properties.QueueName, { delay: 100 });
        await page.waitFor(2000);
        await queueName.press('Enter');
        await page.waitFor(1000);
    } catch (err) {
        await debugScreenshot(page, 'queues-name-error');
        console.error('Failed to Write QueueName', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    await debugScreenshot(page, 'queues-name-done');

    let description = await page.$('#search-desc-input');
    try {
        await description.press('Backspace');
        await description.type(properties.Description, { delay: 100 });
        await page.waitFor(2000);
        await description.press('Enter');
        await page.waitFor(1000);
    } catch (err) {
        await debugScreenshot(page, 'queues-desc-error');
        console.error('Failed to Write Description', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    await debugScreenshot(page, 'queues-desc-done');

    let hrsOfOp = await page.$('#s2id_autogen1 > a');
    try {
        await hrsOfOp.press('Backspace');
        await hrsOfOp.type(properties.HoursOfOperation, { delay: 100 });
        await page.waitFor(2000);
        await hrsOfOp.press('Enter');
        await page.waitFor(1000);
    } catch (err) {
        await debugScreenshot(page, 'queues-hrsOfOp-error');
        console.error('Failed to Write HoursOfOperation', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    await debugScreenshot(page, 'queues-hrsOfOp-done');

    let outbndCallId = await page.$('#angularContainer > div.queue-main-content > div:nth-child(2) > div:nth-child(3) > input.inline-edit-input.c-m-12.queue-control-input-text.queue-callback-display-container.ng-pristine.ng-valid');
    try {
        await outbndCallId.press('Backspace');
        await outbndCallId.type(properties.OutboundCallerIDName, { delay: 100 });
        await page.waitFor(2000);
        await outbndCallId.press('Enter');
        await page.waitFor(1000);
    } catch (err) {
        await debugScreenshot(page, 'queues-outboundCallId-error');
        console.error('Failed to Write OutboundCallerID', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    await debugScreenshot(page, 'queues-outboundCallId-done');

    let outBndCallIdNumBtn = await page.$('#s2id_autogen3 > a');
    console.log('OutBoundCallIdNumButton', outBndCallIdNumBtn);
    try {
        await outBndCallIdNumBtn.click();
    } catch (err) {
        await debugScreenshot(page, 'queues-outboundCallIdNum-error');
        console.error('Failed to click OutBoundCallerIDNumber Button', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    await debugScreenshot(page, 'queues-outboundCallIdNum-done');

    let outBndCallIdNumInput = await page.$('#select2-drop > div > input');
    console.debug('OutBoundCallIdNumInput', outBndCallIdNumInput);
    try {
        await outBndCallIdNumInput.click();
    } catch (err) {
        await debugScreenshot(page, 'queues-outboundCallIdNumInput-error');
        console.error('Failed to click OutboundCallerIDNumber Input', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    await debugScreenshot(page, 'queues-outboundCallIdNumInput-done');

    let outBndCallIdNum = await page.$('#select2-drop > ul > li');
    try {
        await outBndCallIdNum.press('Backspace');
        await outBndCallIdNum.type(properties.OutboundCallerIDNumber, { delay: 100 });
        await page.waitFor(2000);
        await outBndCallIdNum.press('Enter');
        await page.waitFor(1000);
    } catch (err) {
        await debugScreenshot(page, 'queues-outboundCallIdNumType-error');
        console.error('Failed to Write OutboundCallerID', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    await debugScreenshot(page, 'queues-outboundCallIdNumType-done');

    let outBndWsprFlwBtn = await page.$('#s2id_autogen5 > a');
    console.debug('outBndWsprFlwBtn', outBndWsprFlwBtn);
    try {
        await outBndWsprFlwBtn.click();
    } catch (err) {
        await debugScreenshot(page, 'queues-outboundWhisper-error');
        console.error('Failed to click OutboundWhisperFlow Button', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    await debugScreenshot(page, 'queues-outboundWhisper-done');

    let outBndWsprFlwInput = await page.$('#select2-drop > div > input');
    console.debug('outBndWsprFlwInput', outBndWsprFlwInput);
    try {
        await outBndWsprFlwInput.click();
    } catch (err) {
        await debugScreenshot(page, 'queues-outboundWhisperInput-error');
        console.error('Failed to click OutboundWhisperFlow Input', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    await debugScreenshot(page, 'queues-outboundWhisperInput-done');

    if(properties.OutboundWhisperFlow) {
        let outBndWsprFlw = await page.$('#select2-drop > ul > li');
        try {
            await outBndWsprFlw.press('Backspace');
            await outBndWsprFlw.type(properties.OutboundWhisperFlow, { delay: 100 });
            await page.waitFor(2000);
            await outBndWsprFlw.press('Enter');
            await page.waitFor(1000);
        } catch (err) {
            await debugScreenshot(page, 'queues-outboundWhisperFlow-error');
            console.error('Failed to Write OutboundCallerID', JSON.stringify(err));
            console.error('RAW', err);
            return err;
        }
        await debugScreenshot(page, 'queues-outboundWhisperFlow-done');
    }

    if(properties.MaximumContactsInQueue) {
        let setLimit = await page.$('#awsui-checkbox-0');
        console.debug('setLimit', setLimit);
        try {
            await setLimit.click();
        } catch (err) {
            await debugScreenshot(page, 'queues-maxContact-error');
            console.error('Failed to click SetLimit Button', JSON.stringify(err));
            console.error('RAW', err);
            return err;
        }
        await debugScreenshot(page, 'queues-maxContact-done');

        let setLimitInput = await page.$('#lily-admin-queue-set-limit-input');
        try {
            await setLimitInput.press('Backspace');
            await setLimitInput.type(properties.MaximumContactsInQueue, { delay: 100 });
            await page.waitFor(2000);
            await setLimitInput.press('Enter');
            await page.waitFor(1000);
        } catch (err) {
            await debugScreenshot(page, 'queues-maxContactInput-error');
            console.error('Failed to Write MaximumContactsInQueue', JSON.stringify(err));
            console.error('RAW', err);
            return err;
        }
        await debugScreenshot(page, 'queues-maxContactInput-done');
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
                await debugScreenshot(page, 'queues-maxContactType-error');
                console.error('Failed to Write MaximumContactsInQueue', JSON.stringify(err));
                console.error('RAW', err);
                return err;
            }
            await debugScreenshot(page, 'queues-maxContact-done');
        }
    }
    await debugScreenshot(page, 'queues-done');

}

module.exports.deleteQueue = async (page, properties) => {

}

// Queue CRUD Funcs utilizing SDK
module.exports.createQueue = async (properties) => {
    console.debug('QUEUE PROPS', JSON.stringify(properties));
    const instanceId = await getInstanceId(properties.ConnectInstance);

    const params = {};
    params.HoursOfOperationId = await getHoursOfOperationId(properties.HoursOfOperation, instanceId);
    params.InstanceId = instanceId;
    params.Name = properties.Name;
    params.Description = (properties.Description) ? properties.Description : '';
    params.MaxContacts = (properties.MaxContacts) ? properties.MaxContacts : 5;
    params.QuickConnectIds = (properties.QuickConnectIds) ? properties.QuickConnectIds : [];
    params.OutboundCallerConfig = {};
    if (properties.OutboundCallerConfig) {
        if (properties.OutboundCallerConfig.OutboundCallerIdName) {
            params.OutboundCallerConfig.OutboundCallerIdName = properties.OutboundCallerConfig.OutboundCallerIdName;
        }
        if (properties.OutboundCallerConfig.OutboundCallerIdNumberId) {
            params.OutboundCallerConfig.OutboundCallerIdNumberId = properties.OutboundCallerConfig.OutboundCallerIdNumberId;
        }
        if (properties.OutboundCallerConfig.OutboundFlowId) {
            params.OutboundCallerConfig.OutboundFlowId = properties.OutboundCallerConfig.OutboundFlowId;
        }
    }

    let queue;
    try {
        queue = await connect.createQueue(params).promise();
        console.debug('Queue', JSON.stringify(queue));
    } catch (err) {
        console.error('Failed to CreateQueue', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    return queue;
};
const url = require('url');
const AWS = require('aws-sdk');

const connect = new AWS.Connect();
const { debugScreenshot } = require('../../puppeteer');

module.exports.getHoursOfOperationId = async (hooName, instanceId) => {
    const params = {
        InstanceId: instanceId
    };
    console.debug('ListHours Params', JSON.stringify(params));
    let res;
    try {
        res = await connect.listHoursOfOperations(params).promise();
        console.debug('HoursOfOperation List', JSON.stringify(res));
        console.debug('HoursOfOperation Name:', hooName);
        return res.HoursOfOperationSummaryList.filter(x => x.Name === hooName)[0].Id;
    } catch (err) {
        console.error('Failed to ListHoursOfOperation', JSON.stringify(err));
        console.error('RAW', err);
        throw err;
    }
}

module.exports.createHoursOfOperation = async (page, properties) => {
    console.debug('HoursOfOperation', JSON.stringify(properties));

    let host = 'https://' + new url.URL(await page.url()).host;
    console.log('HOST', host);
    console.log('PROPERTIES:', JSON.stringify(properties));
 
    let retries = 0;
    do {
        await page.goto(host + "/connect/operating-hours/create");
        await page.waitFor(5000);
        console.log("Checking for correct load");
        console.log(host + "/connect/operating-hours/create");
        retries++;
    } while ((await page.$('#angularContainer') === null) && retries < 5);
 
    await debugScreenshot(page, 'hours-of-operation-start');

    // Enter Name for HoursOfOperation
    await page.waitForSelector("#general-container > div:nth-child(1) > div > div > div:nth-child(2) > input", {visible: true, timeout: 5000 });
    let nameInput = await page.$("#general-container > div:nth-child(1) > div > div > div:nth-child(2) > input");
    console.debug('NameInput', nameInput);
//    try {
    console.debug('Type Name');
    await nameInput.type(properties.Name, { delay: 100 });
/*     } catch (err) {
        console.error('Failed to Name HoursOfOperation', JSON.stringify(err));
        console.error('RAW', err);
        await debugScreenshot(page, 'hours-of-operation-name-error');
        return err;
    } */
    await debugScreenshot(page, 'hours-of-operation-name-done');

    // Enter Description for HoursOfOperation
    let descInput = await page.$("#awsui-textarea-0");
    try {
        console.debug('Type Description');
        //await descInput.press('Backspace');
        await descInput.type(properties.Description, { delay: 100 });
    } catch (err) {
        console.error('Failed to Name HoursOfOperation', JSON.stringify(err));
        console.error('RAW', err);
        await debugScreenshot(page, 'hours-of-operation-name-error');
        return err;
    }
    await debugScreenshot(page, 'hours-of-operation-desc-done');

    // Select Timezone
    let tzSelect = await page.$("#s2id_autogen1 > a");
    try {
        console.debug('Select Timezone');
        await tzSelect.click();
    } catch (err) {
        console.error('Failed to Click TimeZone Select', JSON.stringify(err));
        console.error('RAW', err);
        await debugScreenshot(page, 'hours-of-operation-timezone-select-error');
        return err;
    }
    await debugScreenshot(page, 'hours-of-operation-timezone-select-done');

    let tzInput = await page.$("#select2-drop > div > input");
    try {
        console.debug('Type TimeZone');
        // await tzInput.press('Backspace');
        await tzInput.type(properties.TimeZone, { delay: 100 });
        await page.waitFor(2000);
        const timezones = await page.$x('//*[@id="select2-drop"]/ul/li/div');
        console.debug('timezones', timezones.length);
        let tz;
        for(let i  = 0; i < timezones.length; i++) {
            let tagName = await page.evaluate(el => el.tagName, timezones[i]);
            let txt = await page.evaluate(el => el.textContent, timezones[i]);
            console.debug('TAG NAME:', tagName);
            console.debug('TEXT CONTENT:', txt);
            if(txt === properties.TimeZone) {
                tz = timezones[i];
            }
        }
        
        await debugScreenshot(page, 'hours-of-operation-timezone-select-before-click');
        console.debug('Click TimeZone');
        await tz.click();
    } catch (err) {
        console.error('Failed to Select HoursOfOperation TimeZone', JSON.stringify(err));
        console.error('RAW', err);
        await debugScreenshot(page, 'hours-of-operation-timezone-select-error');
        return err;
    }
    await debugScreenshot(page, 'hours-of-operation-timezone-select-clicked');

    // Select Days
    const days = {
        'Sunday': 1,
        'Monday': 2,
        'Tuesday': 3,
        'Wednesday': 4,
        'Thursday': 5,
        'Friday': 6,
        'Saturday': 7
    };

    for (day of properties.Days) {

        // Enable Day
        let dayBox = await page.$(`#awsui-checkbox-${days[day.Name]}`);
        try {
            console.debug('Click DayBox');
            await dayBox.click();
            await page.waitFor(2000);
        } catch (err) {
            console.error('Failed to Check Day Box', JSON.stringify(err));
            console.error('RAW', err);
            await debugScreenshot(page, 'hours-of-operation-day-select-error');
        }

        // set Start Hour
        let startHour = await page.$(`#general-container > div.awsui-row.lily-card > table > tbody > tr:nth-child(${days[day.Name]}) > td:nth-child(3) > div > div:nth-child(1) > input`);
        try {
            console.debug('Type Start Hour');
            await startHour.press('Backspace');
            await startHour.press('Backspace');
            await page.waitFor(1000);
            await startHour.type(day.Start.Hour);
            await page.waitFor(500);
        } catch (err) {
            console.error('Failed to Select Start Hour for HoursOfOperation', JSON.stringify(err));
            console.error('RAW', err);
            await debugScreenshot(page, 'hours-of-operation-start-hour-select-error');
        }
        await debugScreenshot(page, 'hours-of-operation-start-hour-select-done');

        // set Start Minute
        let startMinute = await page.$(`#general-container > div.awsui-row.lily-card > table > tbody > tr:nth-child(${days[day.Name]}) > td:nth-child(3) > div > div:nth-child(3) > input`);
        try {
            console.debug('Type Start Minute');
            await startMinute.press('Backspace');
            await startMinute.press('Backspace');
            await page.waitFor(1000);
            await startMinute.type(day.Start.Minute);
            await page.waitFor(500);
        } catch (err) {
            console.error('Failed to Select Start Minute for HoursOfOperation', JSON.stringify(err));
            console.error('RAW', err);
            await debugScreenshot(page, 'hours-of-operation-start-minute-select-error');
        }
        await debugScreenshot(page, 'hours-of-operation-start-minute-select-done');

        // set StartTime AM/PM
        if(day.Start.AMPM.toLowerCase() === 'pm') {
            let amPm = await page.$(`#general-container > div.awsui-row.lily-card > table > tbody > tr:nth-child(${days[day.Name]}) > td:nth-child(3) > div > div:nth-child(4) > button`);
            try {
                console.debug('Select AM/PM');
                await amPm.click();
                await page.waitFor(2000);
            } catch (err) {
                console.error('Failed to Select Start AM/PM for HoursOfOperation', JSON.stringify(err));
                console.error('RAW', err);
                await debugScreenshot(page, 'hours-of-operation-start-ampm-select-error');
            }
            await debugScreenshot(page, 'hours-of-operation-start-ampm-select-done');
        }

        // set End Hour
        let endHour = await page.$(`#general-container > div.awsui-row.lily-card > table > tbody > tr:nth-child(${days[day.Name]}) > td:nth-child(4) > div > div:nth-child(1) > input`);
        try {
            console.debug('Type End Hour');
            await endHour.press('Backspace');
            await endHour.press('Backspace');
            await page.waitFor(1000);
            await endHour.type(day.End.Hour);
            await page.waitFor(500);
        } catch (err) {
            console.error('Failed to Select End Hour for HoursOfOperation', JSON.stringify(err));
            console.error('RAW', err);
            await debugScreenshot(page, 'hours-of-operation-end-hour-select-error');
        }
        await debugScreenshot(page, 'hours-of-operation-end-hour-select-done');
        
        // set End Minute
        let endMinute = await page.$(`#general-container > div.awsui-row.lily-card > table > tbody > tr:nth-child(${days[day.Name]}) > td:nth-child(4) > div > div:nth-child(3) > input`);
        try {
            console.debug('Type End Minute');
            await endMinute.press('Backspace');
            await endMinute.press('Backspace');
            await page.waitFor(1000);
            await endMinute.type(day.End.Minute);
            await page.waitFor(500);
        } catch (err) {
            console.error('Failed to Select End Minute for HoursOfOperation', JSON.stringify(err));
            console.error('RAW', err);
            await debugScreenshot(page, 'hours-of-operation-end-minute-select-error');
        }
        await debugScreenshot(page, 'hours-of-operation-end-minute-select-done');

        // set EndTime AM/PM
        if(day.End.AMPM.toLowerCase() === 'am') {
            let amPm = await page.$(`#general-container > div.awsui-row.lily-card > table > tbody > tr:nth-child(${days[day.Name]}) > td:nth-child(4) > div > div:nth-child(4) > button`);
            try {
                console.debug('Select End AM/PM');
                await amPm.click();
                await page.waitFor(2000);
            } catch (err) {
                console.error('Failed to Select End AM/PM for HoursOfOperation', JSON.stringify(err));
                console.error('RAW', err);
                await debugScreenshot(page, 'hours-of-operation-end-ampm-select-error');
            }
            await debugScreenshot(page, 'hours-of-operation-end-ampm-select-done');
        }
    }

    let saveBtn = await page.$("#angularContainer > div.awsui-grid > div.ng-scope > button");
    await debugScreenshot(page, 'hours-of-before-save');
    try {
        console.debug('Click Save');
        await saveBtn.click();
    } catch (err) {
        console.error('Failed to Save HoursOfOperation', JSON.stringify(err));
        console.error('RAW', err);
        await debugScreenshot(page, 'hours-of-operation-save-error');
    }
    await page.waitFor(5000);
    await debugScreenshot(page, 'hours-of-operation-done');

    return {
        'Name': properties.Name
    }

};

module.exports.deleteHoursOfOperation = async (page, properties) => {

};
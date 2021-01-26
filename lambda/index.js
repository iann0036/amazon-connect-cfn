// npm i aws-sdk chrome-aws-lambda puppeteer-core request-promise

const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const AWS = require('aws-sdk');
const fs = require('fs');
const url = require('url');
var rp = require('request-promise');

var s3 = new AWS.S3();
const connect = new AWS.Connect();
const lex = new AWS.LexModelBuildingService();
const instanceInfo = {};

// Debug Funcs
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

// Pupeteer Funcs
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

// Phone Number CRUD Funcs
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

// Connect Helper Funcs
async function getInstanceId(instanceName) {
    let instance;
    try {
        const instances = await connect.listInstances({}).promise();
        console.debug('INSTANCES', JSON.stringify(instances));
        if(instances.err) {
            console.error('ListInstances Failed', JSON.stringify(err));
            console.error('RAW', err);
        }
        instance = instances.InstanceSummaryList.filter(x => x.InstanceAlias === instanceName)[0];
    } catch(err) {
        console.error('ListInstances Failed', JSON.stringify(err));
        console.error('RAW', err);
        throw err;
    }
    return instance.Id;
}

function genMedCon(Channel, Concurrency) {
    return { Channel, Concurrency};
}

// Connect Instance CRUD Funcs
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
    try{
        toDelete = await getInstanceId(properties.Domain);
    } catch(err) {
        console.error('DeleteInstanceFailed', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    try {
        const params = {
            InstanceId: toDelete
        };
        console.debug('DELETION PARAMS', JSON.stringify(params));
        await connect.deleteInstance(params).promise();
    } catch(err) {
        console.error('DeleteInstance Failed', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
}

// Contact Flow CRUD Funcs
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

// Queue CRUD Funcs
async function createQueue(page, properties) {

}

async function deleteQueue(page, properties) {

}

// Routing Profile CRUD Funcs
async function createRoutingProfile(properties) {
    // get connect instance id
    let instanceId;
    try {
        instanceId = await getInstanceId(properties.Domain);
    } catch(err) {
        console.error('Failed to Create RoutingProfile', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    
    // set params
    const params = {
        DefaultOutboundQueueId: properties.DefaultOutboundQueueId,
        Description: properties.Description,
        InstanceId: instanceId,
        MediaConcurrencies: properties.MediaConcurrencies.map(x => genMedCon(x.Channel, x.Concurrency)),
        Name: properties.Name,
        QueueConfigs: properties.QueueConfigs.map(x => genQueueConfig(x.Delay, x.Priority, x.ReferenceChannel, x.Id)),
        Tags: properties.Tags.map(x => genTag(x.Key, x.Value))
    };

    // create routing profile
    try {
        await connect.createRoutingProfile(params).promise();
    } catch(err) {
        console.error('Failed to Create RoutingProfile', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    return {
        status: 204,
        message: 'success!'
    }
}


// Lexbot Helper Funcs
function genMsg(content, contentType, groupNumber) {
    return { content, contentType, groupNumber };
}
function genIntent(intentName, intentVersion) {
    return { intentName, intentVersion };
}
function genTag(key, value) {
    return { key, value };
}
function genOutputCtxt(name, timeToLiveInSeconds, turnsToLive) {
    return { name, timeToLiveInSeconds, turnsToLive };
}
function genSlot(name, 
                 slotConstraint, 
                 defaultValueList, 
                 description,
                 obfuscationSetting,
                 priority,
                 responseCard,
                 sampleUtterances,
                 slotType,
                 slotTypeVersion,
                 valueElicitationPrompt) {
                    return { name, 
                             slotConstraint, 
                             defaultValueSpec: { defaultValueList: defaultValueList.map(x => { return { defaultValue: x } })},
                             description,
                             obfuscationSetting,
                             priority,
                             responseCard,
                             sampleUtterances,
                             slotType,
                             slotTypeVersion,
                             valueElicitationPrompt: {
                                maxAttempts: valueElicitationPrompt.MaxAttempts,
                                messages: valueElicitationPrompt.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
                                responseCard: valueElicitationPrompt.ResponseCard
                             }
                    }
}

// Lexbot CRUD Funcs
async function createLexChatbot(properties) {
    const botParams = {
        name: properties.Name,
        abortStatement: {
            messages: properties.abortStatements.map(x => genMsg(x)),
            responseCard: properties.AbortResponseCard
        },
        childDirected: properties.ChildDirected,
        clarificationPrompt: {
            maxAttempts: properties.ClarificationAttempts,
            messages: clarificationPrompts.map(x => genMsg(x)),
            responseCard: properties.ClarificationResponseCard
        },
        createVersion: properties.CreateVersion,
        description: properties.Description,
        detectSentiment: properties.DetectSentiment,
        enableImprovements: properties.EnableImprovements,
        idleSessionTTLInSeconds: properties.IdleSessionTTLInSeconds,
        intents: properties.Intents.map(x => genIntent(x)),
        nluIntentConfidenceThreshold: properties.NluIntentConfidenceThreshold,
        locale: properties.Locale,
        processBehavior: properties.ProcessBehavior,
        tags: properties.Tags.map(x => genTag(x)),
        voiceId: properties.VoiceId
    };

    // create lex chatbot
    const bot = await lex.putBot(botParams).promise();

    // get connect instance id
    let instanceId;
    try {
        instanceId = await getInstanceId(properties.InstanceName);
    } catch(err) {
        console.error('Associate LexBot Failed', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    
    // associate lex chatbot with connect instance
    try {
        await connect.associateLexBot({
            InstanceId: instanceId,
            LexBot: {
                LexRegion: properties.Region,
                Name: properties.Name
            }
        }).promise();
    } catch(err) {
        console.error('Create Lex Chatbot Failed', JSON.stringify(err));
        console.error('RAW:', err);
    }

    // log result and return
    console.debug('Create Lex Chatbot Result:', JSON.stringify(bot));
    return {
        status: bot.data.status,
        failureReason: bot.data.failureReason,
        checksum: bot.data.checksum
    }
}

async function updateLexChatbot(properties) {
    const botParams = {
        name: properties.Name,
        abortStatement: {
            messages: properties.abortStatements.map(x => genMsg(x)),
            responseCard: properties.AbortResponseCard
        },
        checksum: properties.Checksum,
        childDirected: properties.ChildDirected,
        clarificationPrompt: {
            maxAttempts: properties.ClarificationAttempts,
            messages: clarificationPrompts.map(x => genMsg(x)),
            responseCard: properties.ClarificationResponseCard
        },
        createVersion: properties.CreateVersion,
        description: properties.Description,
        detectSentiment: properties.DetectSentiment,
        enableImprovements: properties.EnableImprovements,
        idleSessionTTLInSeconds: properties.IdleSessionTTLInSeconds,
        intents: properties.Intents.map(x => genIntent(x)),
        nluIntentConfidenceThreshold: properties.NluIntentConfidenceThreshold,
        locale: properties.Locale,
        processBehavior: properties.ProcessBehavior,
        tags: properties.Tags.map(x => genTag(x)),
        voiceId: properties.VoiceId
    };
    const bot = await lex.putBot(botParams).promise();
    return {
        name: bot.data.name,
        status: bot.data.status,
        failureReason: bot.data.failureReason,
        checksum: bot.data.checksum
    }
}

async function deleteLexChatbot(properties) {
    // get connect instance id
    let instanceId;
    try {
        instanceId = await getInstanceId(properties.InstanceName);
    } catch(err) {
        console.error('Failed to Delete Lex Chatbot', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    
    // disassociate lexbot from connect instance
    try {
        await connect.disassociateLexBot({}).promise();
    } catch(err) {
        console.error('Failed to Disassociate Lex Chatbot', JSON.stringify(err));
        console.error('RAW:', err);
    }

    // delete lexbot
    const params = {
        BotName: properties.Name,
        InstanceId: instanceId,
        LexRegion: properties.Region
    };
    try {
        await lex.deleteBot(params).promise();
    } catch(err) {
        console.error('Failed to Delete Lex Chatbot', JSON.stringify(err));
        console.error('RAW:', err);
    }

    // return success
    return {
        status: 204,
        message: 'success!'
    };
}

// Lex Intent CRUD Funcs
async function createLexIntent(properties) {
    const params = {
        name: properties.IntentName,
        conclusionStatement: {
            messages: properties.ConclusionStatements.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
            responseCard: properties.ConclusionResponseCard
        },
        confirmationPrompt: {
            maxAttempts: properties.ConfirmationMaxAttempts,
            messages: properties.ConfirmationPrompts.map(x => genMsg(x.Contnet, x.ContentType, x.GroupNumber)),
            responseCard: properties.ConfirmationResponseCard
        },
        createVersion: properties.CreateVersion,
        description: properties.Description,
        dialogCodeHook: {
            messageVersion: properties.DialogCodeHook.MessageVersion,
            uri: properties.DialogCodeHook.uri
        },
        followUpPrompt: {
            prompt: {
                maxAttempts: properties.FollowUpPrompt.MaxAttempts,
                messages: properties.DialogCodeHook.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
                responseCard: properties.FollowUpPrompt.ResponseCard
            },
            rejectionStatement: {
                messages: properties.RejectionStatement.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
                responseCard: properties.RejectionStatement.ResponseCard
            }
        },
        fulfillmentActivity: {
            type: properties.FulfillmentActivity.Type,
            codeHook: {
                messageVersion: properties.FulfillmentActivity.CodeHook.MessageVersion,
                uri: properties.FulfillmentActivity.CodeHook.Uri
            }
        },
        inputContexts: properties.InputContexts.map(x => {return { name: x.Name } }),
        kendraConfiguration: {
            kendraIndex: properties.KendraConfiguration.KendraIndex,
            role: properties.KendraConfiguration.Role,
            queryFilterString: properties.KendraConfiguration.QueryFilterString
        },
        outputContexts: properties.OutputContexts.map(x => genOutputCtxt(x.Name, x.TTLInSeconds, x.TurnsToLive)),
        parentIntentSignature: properties.ParentIntentSignature,
        rejectionStatement: {
            messages: properties.RejectionStatement.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
            responseCard: properties.RejectionStatement.ResponseCard
        },
        sampleUtterances: properties.SampleUtterances,
        slots: properties.Slots.map(x => genSlot(x.Name, 
                                                 x.SlotConstraint, 
                                                 x.DefaultValueList, 
                                                 x.Description,
                                                 x.ObfuscationSetting,
                                                 x.Priority,
                                                 x.ResponseCard,
                                                 x.SampleUtterances,
                                                 x.SlotType,
                                                 x.SlotTypeVersion,
                                                 x.ValueElicitationPrompt))
    };

    // create Intent
    const data = {};
    try {
        const res = await lex.putIntent(params).promise();
        console.debug('CreateIntent Response', JSON.stringify(res));
    } catch(err) {
        console.error('Failed to PutIntent', JSON.stringify(err));
        console.error('RAW', err);
    }
}

async function updateLexIntent(properties) {
    const params = {
        name: properties.IntentName,
        conclusionStatement: {
            messages: properties.ConclusionStatements.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
            responseCard: properties.ConclusionResponseCard
        },
        confirmationPrompt: {
            maxAttempts: properties.ConfirmationMaxAttempts,
            messages: properties.ConfirmationPrompts.map(x => genMsg(x.Contnet, x.ContentType, x.GroupNumber)),
            responseCard: properties.ConfirmationResponseCard
        },
        createVersion: properties.CreateVersion,
        description: properties.Description,
        dialogCodeHook: {
            messageVersion: properties.DialogCodeHook.MessageVersion,
            uri: properties.DialogCodeHook.uri
        },
        followUpPrompt: {
            prompt: {
                maxAttempts: properties.FollowUpPrompt.MaxAttempts,
                messages: properties.DialogCodeHook.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
                responseCard: properties.FollowUpPrompt.ResponseCard
            },
            rejectionStatement: {
                messages: properties.RejectionStatement.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
                responseCard: properties.RejectionStatement.ResponseCard
            }
        },
        fulfillmentActivity: {
            type: properties.FulfillmentActivity.Type,
            codeHook: {
                messageVersion: properties.FulfillmentActivity.CodeHook.MessageVersion,
                uri: properties.FulfillmentActivity.CodeHook.Uri
            }
        },
        inputContexts: properties.InputContexts.map(x => {return { name: x.Name } }),
        kendraConfiguration: {
            kendraIndex: properties.KendraConfiguration.KendraIndex,
            role: properties.KendraConfiguration.Role,
            queryFilterString: properties.KendraConfiguration.QueryFilterString
        },
        outputContexts: properties.OutputContexts.map(x => genOutputCtxt(x.Name, x.TTLInSeconds, x.TurnsToLive)),
        parentIntentSignature: properties.ParentIntentSignature,
        rejectionStatement: {
            messages: properties.RejectionStatement.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
            responseCard: properties.RejectionStatement.ResponseCard
        },
        sampleUtterances: properties.SampleUtterances,
        slots: properties.Slots.map(x => genSlot(x.Name, 
                                                 x.SlotConstraint, 
                                                 x.DefaultValueList, 
                                                 x.Description,
                                                 x.ObfuscationSetting,
                                                 x.Priority,
                                                 x.ResponseCard,
                                                 x.SampleUtterances,
                                                 x.SlotType,
                                                 x.SlotTypeVersion,
                                                 x.ValueElicitationPrompt))
    };

    // create Intent
    const data = {};
    try {
        const res = await lex.putIntent(params).promise();
        console.debug('CreateIntent Response', JSON.stringify(res));
    } catch(err) {
        console.error('Failed to PutIntent', JSON.stringify(err));
        console.error('RAW', err);
    }
}

async function deleteLexIntent(properties) {
    try {
        await lex.deleteIntent({name: properties.Name}).promise();
    } catch (err) {
        console.error('Failed to Delete Intent', JSON.stringify(err));
        console.error('RAW', err);
    }
}

// Lex SlotType CRUD Funcs
async function createLexSlotType(properties) {
    const params = {
        name: properties.Name,
        createVersion: properties.CreateVersion,
        description: properties.Description,
        enumerationValues: properties.EnumerationValues.map(x => genEnumVal(x.Value, x.Synonyms)),
        parentSlotTypeSignature: properties.ParentSlotTypeSignature,
        slotTypeConfigurations: properties.SlotTypeConfigurations.map(x => genSlotTypeConfig(x.Pattern)),
        valueSelectionStrategy: properties.ValueSelectionStrategy
    };

    // create slot type
    try {
        await lex.putSlotType(params).promise();
    } catch(err) {
        console.error('Put SlotType Failed', JSON.stringify(err));
        console.error('RAW', err);
    }
}

async function updateLexSlotType(properties) {
    const params = {
        name: properties.Name,
        createVersion: properties.CreateVersion,
        description: properties.Description,
        enumerationValues: properties.EnumerationValues.map(x => genEnumVal(x.Value, x.Synonyms)),
        parentSlotTypeSignature: properties.ParentSlotTypeSignature,
        slotTypeConfigurations: properties.SlotTypeConfigurations.map(x => genSlotTypeConfig(x.Pattern)),
        valueSelectionStrategy: properties.ValueSelectionStrategy
    };

    // update slot type
    try {
        await lex.putSlotType(params).promise();
    } catch(err) {
        console.error('Put SlotType Failed', JSON.stringify(err));
        console.error('RAW', err);
    }
}

async function deleteLexSlotType(properties) {
    try {
        await lex.deleteSlotType({name: properties.Name}).promise();
    } catch(err) {
        console.error('Failed to Delete SlotType', JSON.stringify(err));
        console.error('RAW', err);
    }
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

            // CREATE CONNECT INSTANCE
            if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_Instance") {
                response_object.Data = await createConnectInstance(event.ResourceProperties);
            
            // CREATE CONTACT FLOW
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_ContactFlow") {
                await login(page);
                await open(page, event.ResourceProperties);
                response_object.Data = await createflow(page, event.ResourceProperties);

            // CREATE QUEUE
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_Queue") {
                await login(page);
                await open(page, event.ResourceProperties);
                response_object.Data = await createQueue(page, event.ResourceProperties);

            // CREATE ROUTING PROFILE
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_RoutingProfile") {
                response_object.Data = await createRoutingProfile(event.ResourceProperties);

            // CREATE PHONE NUMBER
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_PhoneNumber") {
                await login(page);
                await open(page, event.ResourceProperties);
                response_object.Data = await claimnumber(page, event.ResourceProperties);
                response_object.PhysicalResourceId = response_object.Data.PhoneNumber;
            
            // CREATE LEX CHATBOT
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_LexChatBot") {
                response_object.Data = await createLexChatbot(event.ResourceProperties);

            // CREATE LEX INTENT
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_LexIntent") {
                response_object.Data = await createLexIntent(event.ResourceProperties);

            // CREATE LEX SLOTTYPE
            } else if (event.RequestType == "Create" && event.ResourceType == "Custom::AWS_Connect_LexSlotType") {
                response_object.Data = await createLexSlotType(event.ResourceProperties);

            // UPDATE CONNECT INSTANCE
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_Instance") {
                await deleteConnectInstance(event.ResourceProperties);
                response_object.Data = await createConnectInstance(event.ResourceProperties);

            // UPDATE CONTACT FLOW
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_ContactFlow") {
                await login(page);
                await open(page, event.ResourceProperties);
                response_object.Data = await createContactFlows(event.ResourceProperties);

            // UPDATE QUEUE
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_Queue") {
                await login(page);
                await open(page);
                await deleteQueue(page, event.ResourceProperties);
                response_object.Data = await createQueue(page, event.ResourceProperties);


            // UPDATE PHONE NUMBER
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_PhoneNumber") {
                await login(page);
                await open(page, event.ResourceProperties);
                await deletephonenumber(page, event.PhysicalResourceId);
                response_object.Data = await claimnumber(page, event.ResourceProperties);
                response_object.PhysicalResourceId = response_object.Data.PhoneNumber;

            // UPDATE LEX CHATBOT
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_LexChatBot") {
                response_object.Data = await updateLexChatbot(event.ResourceProperties);

            // UPDATE LEX INTENT
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_LexIntent") {
                response_object.Data = await updateLexIntent(event.ResourceProperties);

            // UPDATE LEX SLOTTYPE
            } else if (event.RequestType == "Update" && event.ResourceType == "Custom::AWS_Connect_LexSlotType") {
                response_object.Data = await updateLexSlotType(event.ResourceProperties);

            // DELETE CONNECT INSTANCE
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_Instance") {
                await deleteConnectInstance(event.ResourceProperties);

            // DELETE QUEUE
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_Queue") {
                await login(page);
                await open(page);
                await deleteQueue(page, event.ResourceProperties);

            // DELETE PHONE NUMBER
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_PhoneNumber") {
                await login(page);
                await open(page, event.ResourceProperties);
                await deletephonenumber(page, event.PhysicalResourceId);

            // DELETE CONTACT FLOW
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_ContactFlow") {
                // do nothing

            // DELETE LEX CHATBOT
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_LexChatBot") {
                await deleteLexChatbot(event.ResourceProperties);

            // DELETE LEX INTENT
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_LexIntent") {
                await deleteLexIntent(event.ResourceProperties);

            // DELETE LEX SLOTTYPE
            } else if (event.RequestType == "Delete" && event.ResourceType == "Custom::AWS_Connect_LexSlotType") {
                await deleteLexSlotType(event.ResourceProperties);
            // default response
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

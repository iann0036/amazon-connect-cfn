const AWS = require('aws-sdk');
const lex = new AWS.LexModelBuildingService();
const connect = new AWS.Connect();
const lambda = new AWS.Lambda();

const { getInstanceId } = require('./connect/connectInstance');

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

    const slot = {
        name,
        slotConstraint,
        description,
        obfuscationSetting,
        priority,
        responseCard,
        sampleUtterances,
        slotType,
        slotTypeVersion
    };

    if (valueElicitationPrompt) {
        slot.valueElicitationPrompt = {};
        if (valueElicitationPrompt.MaxAttempts) {
            slot.valueElicitationPrompt.maxAttempts = valueElicitationPrompt.MaxAttempts;
        }
        if (valueElicitationPrompt.Messages) {
            slot.valueElicitationPrompt.messages = valueElicitationPrompt.Messages.map(x => genMsg(x.Content, x.ContentType));
        }
        if (valueElicitationPrompt.ResponseCard) {
            slot.valueElicitationPrompt.responseCard;
        }
    }

    if (defaultValueList) {
        slot.defaultValueSpec = { defaultValueList: defaultValueList.map(x => { return { defaultValue: x } }) };
    }

    return slot;
}
function genSlotTypeConfig(pattern) {
    return {
        regexConfiguration: {
            pattern
        }
    }
}
function genEnumVal(value, synonyms) {
    return {
        value,
        synonyms
    }
}
const delay = (t, val) => {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(val);
        }, t);
    });
 }


// Lexbot CRUD Funcs
module.exports.createLexChatbot = async (properties) => {
    console.debug(properties.Name, JSON.stringify(properties));
    const botParams = {};
    botParams.name = properties.Name;

    if (properties.Description) {
        botParams.description = properties.Description;
    }
    if (properties.DetectSentiment) {
        botParams.detectSentiment = (properties.DetectSentiment === 'true');
    }
    if (properties.EnableModelImprovements) {
        botParams.enableModelImprovements = (properties.EnableModelImprovements === 'true');
    }
    if (properties.CreateVersion) {
        botParams.createVersion = properties.CreateVersion;
    }
    if (properties.IdleSessionTTLInSeconds) {
        botParams.idleSessionTTLInSeconds = properties.IdleSessionTTLInSeconds;
    }
    if (properties.ChildDirected) {
        console.debug('CHILD DIRECTED', properties.ChildDirected);
        console.debug('TYPEOF', typeof properties.ChildDirected);
        botParams.childDirected = (properties.ChildDirected === 'true');
    }

    botParams.abortStatement = {};
    if (properties.AbortStatements) {
        botParams.abortStatement.messages = properties.AbortStatements.Messages.map(x => genMsg(x.Content, x.ContentType));
        if (properties.AbortStatements.ResponseCard) {
            botParams.abortStatement.responseCard = properties.AbortResponseCard;
        }
    }

    botParams.clarificationPrompt = {};
    if (properties.ClarificationPrompt.MaxAttempts) {
        botParams.clarificationPrompt.maxAttempts = properties.ClarificationPrompt.MaxAttempts;
    }
    if (properties.ClarificationPrompt.Messages) {
        botParams.clarificationPrompt.messages = properties.ClarificationPrompt.Messages.map(x => genMsg(x.Content, x.ContentType));
    }
    if (properties.ClarificationPrompt.ResponseCard) {
        botParams.clarificationPrompt.responseCard = properties.ClarificationPrompt.ResponseCard;
    }
    botParams.intents = [];
    if (properties.Intents) {
        botParams.intents = properties.Intents.map(x => genIntent(x.IntentName, x.IntentVersion));
    }
    if (properties.NluIntentConfidenceThreshold) {
        botParams.nluIntentConfidenceThreshold = properties.NluIntentConfidenceThreshold;
    }
    if (properties.Locale) {
        botParams.locale = properties.Locale
    }
    if (properties.ProcessBehavior) {
        botParams.processBehavior = properties.ProcessBehavior;
    }
    if (properties.Tags) {
        botParams.tags = properties.Tags.map(x => genTag(x.Key, x.Value));
    }
    if (properties.VoiceId) {
        botParams.voiceId = properties.VoiceId;
    }

    // create lex chatbot
    let bot;
    try {
        bot = await lex.putBot(botParams).promise();
    } catch (err) {
        console.error('Put LexBot Failed', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    // get connect instance id
    let instanceId;
    try {
        instanceId = await getInstanceId(properties.InstanceName);
    } catch (err) {
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
    } catch (err) {
        console.error('Create Lex Chatbot Failed', JSON.stringify(err));
        console.error('RAW:', err);
    }

    // log result and return
    console.debug('Create Lex Chatbot Result:', JSON.stringify(bot));
    return {
        Name: properties.Name,
        Status: bot.status,
        Checksum: bot.checksum
    }
}

module.exports.updateLexChatbot = async (properties) => {
    const botParams = {};
    botParams.name = properties.Name;

    if (properties.Description) {
        botParams.description = properties.Description;
    }
    if (properties.DetectSentiment) {
        botParams.detectSentiment = (properties.DetectSentiment === 'true');
    }
    if (properties.EnableModelImprovements) {
        botParams.enableModelImprovements = (properties.EnableModelImprovements === 'true');
    }
    if (properties.CreateVersion) {
        botParams.createVersion = properties.CreateVersion;
    }
    if (properties.IdleSessionTTLInSeconds) {
        botParams.idleSessionTTLInSeconds = properties.IdleSessionTTLInSeconds;
    }
    if (properties.ChildDirected) {
        console.debug('CHILD DIRECTED', properties.ChildDirected);
        console.debug('TYPEOF', typeof properties.ChildDirected);
        botParams.childDirected = (properties.ChildDirected === 'true');
    }

    botParams.abortStatement = {};
    if (properties.AbortStatements) {
        botParams.abortStatement.messages = properties.AbortStatements.Messages.map(x => genMsg(x.Content, x.ContentType));
        if (properties.AbortStatements.ResponseCard) {
            botParams.abortStatement.responseCard = properties.AbortResponseCard;
        }
    }

    botParams.clarificationPrompt = {};
    if (properties.ClarificationPrompt.MaxAttempts) {
        botParams.clarificationPrompt.maxAttempts = properties.ClarificationPrompt.MaxAttempts;
    }
    if (properties.ClarificationPrompt.Messages) {
        botParams.clarificationPrompt.messages = properties.ClarificationPrompt.Messages.map(x => genMsg(x.Content, x.ContentType));
    }
    if (properties.ClarificationPrompt.ResponseCard) {
        botParams.clarificationPrompt.responseCard = properties.ClarificationPrompt.ResponseCard;
    }
    botParams.intents = [];
    if (properties.Intents) {
        botParams.intents = properties.Intents.map(x => genIntent(x.IntentName, x.IntentVersion));
    }
    if (properties.NluIntentConfidenceThreshold) {
        botParams.nluIntentConfidenceThreshold = properties.NluIntentConfidenceThreshold;
    }
    if (properties.Locale) {
        botParams.locale = properties.Locale
    }
    if (properties.ProcessBehavior) {
        botParams.processBehavior = properties.ProcessBehavior;
    }
    if (properties.Tags) {
        botParams.tags = properties.Tags.map(x => genTag(x.Key, x.Value));
    }
    if (properties.VoiceId) {
        botParams.voiceId = properties.VoiceId;
    }

    try {
        const bot = await lex.putBot(botParams).promise();
        return {
            name: bot.data.name,
            status: bot.data.status,
            failureReason: bot.data.failureReason,
            checksum: bot.data.checksum
        }
    } catch (err) {
        console.error('UpdateLexBot Failed', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
}

module.exports.deleteLexChatbot = async (properties) => {
    // get connect instance id
    let instanceId;
    try {
        instanceId = await getInstanceId(properties.InstanceName);
    } catch (err) {
        console.error('Failed to Delete Lex Chatbot', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    // disassociate lexbot from connect instance
    try {
        await connect.disassociateLexBot({}).promise();
    } catch (err) {
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
    } catch (err) {
        console.error('Failed to Delete Lex Chatbot', JSON.stringify(err));
        console.error('RAW:', err);
        return err;
    }

    // return success
    return {
        Name: properties.Name,
        Success: true
    };
}

// Lex Intent CRUD Funcs
module.exports.createLexIntent = async (properties) => {
    console.debug(properties.Name, JSON.stringify(properties));
    await delay(60000);
    const params = {};
    params.name = properties.Name;
    if (properties.CreateVersion) {
        params.createVersion = properties.CreateVersion;
    }
    if (properties.Description) {
        params.description = properties.Description;
    }
    if (properties.ConclusionStatement) {
        params.conclusionStatement = {};
        if (properties.ConclusionStatement.Messages) {
            params.conclusionStatement.messages = properties.ConclusionStatement.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber));
        }
        if (properties.ConclusionStatement.ResponseCard) {
            params.conclusionStatement.responseCard = properties.ConclusionStatement.ResponseCard;
        }
    }
    if (properties.ConfirmationPrompt) {
        params.confirmationPrompt = {};
        if (properties.ConfirmationPrompt.MaxAttempts) {
            params.confirmationPrompt.maxAttempts = properties.ConfirmationPrompt.MaxAttempts;
        }
        if (properties.ConfirmationPrompt.Messages) {
            params.confirmationPrompt.messages = properties.ConfirmationPrompt.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber));
        }
        if (properties.ConfirmationPrompt.ResponseCard) {
            params.confirmationPrompt.responseCard = properties.ConfirmationPrompt.ResponseCard;
        }
    }
    if (properties.DialogCodeHook) {
        console.debug('MSG VERSION', properties.DialogCodeHook.MessageVersion);
        params.dialogCodeHook = {
            messageVersion: properties.DialogCodeHook.MessageVersion,
            uri: properties.DialogCodeHook.URI
        }
    }
    if (properties.FollowUpPrompt) {
        params.followUpPrompt = {
            prompt: {
                maxAttempts: properties.FollowUpPrompt.Prompt.MaxAttempts,
                messages: properties.FollowUpPrompt.Prompt.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
                responseCard: properties.FollowUpPrompt.Prompt.ResponseCard
            },
            rejectionStatement: {
                messages: properties.FollowUpPrompt.RejectionStatement.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
                responseCard: properties.FollowUpPrompt.RejectionStatement.ResponseCard
            }
        }
    }
    if (properties.FulfillmentActivity) {
        params.fulfillmentActivity = {
            type: properties.FulfillmentActivity.Type
        }
        if (properties.FulfillmentActivity.CodeHook) {
            params.fulfillmentActivity.codeHook = {
                messageVersion: properties.FulfillmentActivity.CodeHook.MessageVersion,
                uri: properties.FulfillmentActivity.CodeHook.URI
            }
        }
    }
    if (properties.InputContexts) {
        params.inputContexts = properties.InputContexts.map(x => { return { name: x.Name } });
    }
    if (properties.KendraConfiguration) {
        params.kendraConfiguration = {
            kendraIndex: properties.KendraConfiguration.KendraIndex,
            role: properties.KendraConfiguration.Role,
            queryFilterString: properties.KendraConfiguration.QueryFilterString
        }
    }
    if (properties.OutputContexts) {
        params.outputContexts = properties.OutputContexts.map(x => genOutputCtxt(x.Name, x.TTLInSeconds, x.TurnsToLive));
    }
    if (properties.ParentIntentSignagure) {
        params.parentIntentSignature = properties.ParentIntentSignature;
    }
    if (properties.RejectionStatement) {
        params.rejectionStatement = {
            messages: properties.RejectionStatement.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
        }
        if (properties.RejectionStatement.ResponseCard) {
            params.rejectionStatement.responseCard = properties.RejectionStatement.ResponseCard;
        }
    }
    if (properties.SampleUtterances) {
        params.sampleUtterances = properties.SampleUtterances;
    }
    if (properties.Slots) {
        console.debug('SLOTS', properties.Slots);
        params.slots = properties.Slots.map(x => genSlot(x.Name,
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
    }

    // create Intent
    try {
        const res = await lex.putIntent(params).promise();
        console.debug('CreateIntent Response', JSON.stringify(res));
    } catch (err) {
        console.error('Failed to PutIntent', JSON.stringify(err));
        console.error('RAW', err);
    }

    return {
        Name: properties.Name
    }
}

module.exports.updateLexIntent = async (properties) => {
    console.debug(properties.Name, JSON.stringify(properties));
    const params = {};
    params.name = properties.Name;
    if (properties.CreateVersion) {
        params.createVersion = properties.CreateVersion;
    }
    if (properties.Description) {
        params.description = properties.Description;
    }
    if (properties.ConclusionStatement) {
        params.conclusionStatement = {};
        if (properties.ConclusionStatement.Messages) {
            params.conclusionStatement.messages = properties.ConclusionStatement.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber));
        }
        if (properties.ConclusionStatement.ResponseCard) {
            params.conclusionStatement.responseCard = properties.ConclusionStatement.ResponseCard;
        }
    }
    if (properties.ConfirmationPrompt) {
        params.confirmationPrompt = {};
        if (properties.ConfirmationPrompt.MaxAttempts) {
            params.confirmationPrompt.maxAttempts = properties.ConfirmationPrompt.MaxAttempts;
        }
        if (properties.ConfirmationPrompt.Messages) {
            params.confirmationPrompt.messages = properties.ConfirmationPrompt.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber));
        }
        if (properties.ConfirmationPrompt.ResponseCard) {
            params.confirmationPrompt.responseCard = properties.ConfirmationPrompt.ResponseCard;
        }
    }
    if (properties.DialogCodeHook) {
        params.dialogCodeHook = {
            messageVersion: properties.DialogCodeHook.MessageVersion,
            uri: properties.DialogCodeHook.URI
        }
    }
    if (properties.FollowUpPrompt) {
        params.followUpPrompt = {
            prompt: {
                maxAttempts: properties.FollowUpPrompt.Prompt.MaxAttempts,
                messages: properties.FollowUpPrompt.Prompt.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
                responseCard: properties.FollowUpPrompt.Prompt.ResponseCard
            },
            rejectionStatement: {
                messages: properties.FollowUpPrompt.RejectionStatement.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
                responseCard: properties.FollowUpPrompt.RejectionStatement.ResponseCard
            }
        }
    }
    if (properties.FulfillmentActivity) {
        params.fulfillmentActivity = {
            type: properties.FulfillmentActivity.Type
        }
        if (properties.FulfillmentActivity.CodeHook) {
            params.fulfillmentActivity.codeHook = {
                messageVersion: properties.FulfillmentActivity.CodeHook.MessageVersion,
                uri: properties.FulfillmentActivity.CodeHook.URI
            }
        }
    }
    if (properties.InputContexts) {
        params.inputContexts = properties.InputContexts.map(x => { return { name: x.Name } });
    }
    if (properties.KendraConfiguration) {
        params.kendraConfiguration = {
            kendraIndex: properties.KendraConfiguration.KendraIndex,
            role: properties.KendraConfiguration.Role,
            queryFilterString: properties.KendraConfiguration.QueryFilterString
        }
    }
    if (properties.OutputContexts) {
        params.outputContexts = properties.OutputContexts.map(x => genOutputCtxt(x.Name, x.TTLInSeconds, x.TurnsToLive));
    }
    if (properties.ParentIntentSignagure) {
        params.parentIntentSignature = properties.ParentIntentSignature;
    }
    if (properties.RejectionStatement) {
        params.rejectionStatement = {
            messages: properties.RejectionStatement.Messages.map(x => genMsg(x.Content, x.ContentType, x.GroupNumber)),
        }
        if (properties.RejectionStatement.ResponseCard) {
            params.rejectionStatement.responseCard = properties.RejectionStatement.ResponseCard;
        }
    }
    if (properties.SampleUtterances) {
        params.sampleUtterances = properties.SampleUtterances;
    }
    if (properties.Slots) {
        console.debug('SLOTS', properties.Slots);
        params.slots = properties.Slots.map(x => genSlot(x.Name,
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
    }

    // create Intent
    const data = {};
    try {
        const res = await lex.putIntent(params).promise();
        console.debug('CreateIntent Response', JSON.stringify(res));
    } catch (err) {
        console.error('Failed to PutIntent', JSON.stringify(err));
        console.error('RAW', err);
    }
}

module.exports.deleteLexIntent = async (properties) => {
    try {
        await lex.deleteIntent({ name: properties.Name }).promise();
    } catch (err) {
        console.error('Failed to Delete Intent', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    return {
        Name: properties.Name,
        Success: true
    }
}

// Lex SlotType CRUD Funcs
module.exports.createLexSlotType = async (properties) => {
    console.debug(properties.Name, JSON.stringify(properties));
    const params = {};
    params.name = properties.Name;

    if (properties.Description) {
        params.description = properties.Description;
    }
    if (properties.CreateVersion) {
        params.createVersion = properties.CreateVersion;
    }
    if (properties.EnumerationValues) {
        params.enumerationValues = properties.EnumerationValues.map(x => genEnumVal(x.Value, x.Synonyms));
    }
    if (properties.ParentSlotTypeSignature) {
        params.parentSlotTypeSignature = properties.ParentSlotTypeSignature;
    }
    if (properties.SlotTypeConfigurations) {
        params.slotTypeConfigurations = properties.SlotTypeConfigurations.map(x => genSlotTypeConfig(x));
    }
    if (properties.ValueSelectionStrategy) {
        params.valueSelectionStrategy = properties.ValueSelectionStrategy;
    }

    // create slot type
    try {
        await lex.putSlotType(params).promise();
    } catch (err) {
        console.error('Put SlotType Failed', JSON.stringify(err));
        console.error('RAW', err);
    }

    return {
        Name: properties.Name
    }
}

module.exports.updateLexSlotType = async (properties) => {
    const params = {};
    params.name = properties.Name;

    if (properties.Description) {
        params.description = properties.Description;
    }
    if (properties.CreateVersion) {
        params.createVersion = properties.CreateVersion;
    }
    if (properties.EnumerationValues) {
        params.enumerationValues = properties.EnumerationValues.map(x => genEnumVal(x.Value, x.Synonyms));
    }
    if (properties.ParentSlotTypeSignature) {
        params.parentSlotTypeSignature = properties.ParentSlotTypeSignature;
    }
    if (properties.SlotTypeConfigurations) {
        params.slotTypeConfigurations = properties.SlotTypeConfigurations.map(x => genSlotTypeConfig(x));
    }
    if (properties.ValueSelectionStrategy) {
        params.valueSelectionStrategy = properties.ValueSelectionStrategy;
    }

    // update slot type
    try {
        await lex.putSlotType(params).promise();
    } catch (err) {
        console.error('Put SlotType Failed', JSON.stringify(err));
        console.error('RAW', err);
    }
}

module.exports.deleteLexSlotType = async (properties) => {
    try {
        await lex.deleteSlotType({ name: properties.Name }).promise();
    } catch (err) {
        console.error('Failed to Delete SlotType', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    return {
        Name: properties.Name,
        Success: true
    }
}

// Lex Permission CRUD Funcs
module.exports.createLexPermission = async (properties) => {
    console.debug('CREATE LEX PERMISSON');
    let sourceArn = properties.Source[0].split(':');
    sourceArn.splice(4, 1, process.env.ACCOUNTID);
    sourceArn = sourceArn.join(':');
    console.debug('SOURCE', sourceArn);
    const permissions = {
        StatementId: properties.Sid,
        Action: properties.Action,
        FunctionName: properties.Resource.split(':').pop(),
        Principal: properties.Principal
    };
    console.debug('PERMISSION', JSON.stringify(permissions));

    // add invokeLambda permissions for LexBot
    try {
        await lambda.addPermission(permissions).promise();
    } catch (err) {
        console.error('FAILED to AddPermission', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    return {
        Success: true,
        Name: properties.Name
    }
}
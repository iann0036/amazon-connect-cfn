const AWS = require('aws-sdk');
const lex = new AWS.LexModelBuildingService();
const connect = new AWS.Connect();

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
            slot.valueElicitationPrompt.messages = valueElicitationPrompt.Messages;
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


// Lexbot CRUD Funcs
module.exports.createLexChatbot = async (properties) => {
    console.debug(properties.Type, JSON.stringify(properties));
    const botParams = {};
    botParams.name = properties.Name;

    if (properties.Description) {
        botParams.description = properties.Description;
    }
    if (properties.DetectSentiment) {
        botParams.detectSentiment = properties.DetectSentiment;
    }
    if (properties.EnableImprovements) {
        botParams.enableImprovements = properties.EnableImprovements;
    }
    if (properties.CreateVersion) {
        botParams.createVersion = properties.CreateVersion;
    }
    if (properties.IdleSessionTTLInSeconds) {
        botParams.idleSessionTTLInSeconds = properties.IdleSessionTTLInSeconds;
    }
    if (properties.ChildDirected) {
        botParams.childDirected = properties.ChildDirected;
    }

    botParams.abortStatement = {};
    if (properties.AbortStatements) {
        botParams.abortStatement.messages = properties.AbortStatements.Messages.map(x => genMsg(x));
        if (properties.AbortStatements.ResponseCard) {
            botParams.abortStatement.responseCard = properties.AbortResponseCard;
        }
    }

    botParams.ClarificationPrompt = {};
    if (properties.ClarificationPrompt.MaxAttempts) {
        botParams.clarificationPrompt.maxAttempts = properties.ClarificationPrompt.MaxAttempts;
    }
    if (properties.ClarificationPrompt.Messages) {
        botParams.clarificationPrompt.messages = properties.ClarificationPrompt.Messages.map(x => genMsg(x));
    }
    if (properties.ClarificationPrompt.ResponseCard) {
        botParams.clarificationPrompt.responseCard = properties.ClarificationPrompt.ResponseCard;
    }
    botParams.intents = [];
    if (properties.Intents) {
        botParams.intents = properties.Intents.map(x => genIntent(x));
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
        botParams.tags = properties.Tags.map(x => genTag(x));
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
    console.debug(properties.Type, JSON.stringify(properties));
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
            params.confirmationPrompt.messages = properties.ConfirmationPrompt.Messages.map(x => genMsg(x.Contnet, x.ContentType, x.GroupNumber));
        }
        if (properties.ConfirmationPrompt.ResponseCard) {
            params.confirmationPrompt.responseCard = properties.ConfirmationPrompt.ResponseCard;
        }
    }
    if (properties.DialogCodeHook) {
        params.dialogCodeHook = {
            messageVersion: properties.DialogCodeHook.MessageVersion,
            uri: properties.DialogCodeHook.uri
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
            type: properties.FulfillmentActivity.Type,
            codeHook: {
                messageVersion: properties.FulfillmentActivity.CodeHook.MessageVersion,
                uri: properties.FulfillmentActivity.CodeHook.Uri
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
        inputContexts: properties.InputContexts.map(x => { return { name: x.Name } }),
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
    console.debug(properties.Type, JSON.stringify(properties));
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
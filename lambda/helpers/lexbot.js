const AWS = require('aws-sdk');
const lex = new AWS.LexModelBuildingService();
const connect = new AWS.Connect();

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
module.exports.createLexChatbot = async (properties) => {
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
module.exports.createLexIntent = async (properties) => {
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

module.exports.deleteLexIntent = async (properties) => {
    try {
        await lex.deleteIntent({name: properties.Name}).promise();
    } catch (err) {
        console.error('Failed to Delete Intent', JSON.stringify(err));
        console.error('RAW', err);
    }
}

// Lex SlotType CRUD Funcs
module.exports.createLexSlotType = async (properties) => {
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

module.exports.updateLexSlotType = async (properties) => {
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

module.exports.deleteLexSlotType = async (properties) => {
    try {
        await lex.deleteSlotType({name: properties.Name}).promise();
    } catch(err) {
        console.error('Failed to Delete SlotType', JSON.stringify(err));
        console.error('RAW', err);
    }
}
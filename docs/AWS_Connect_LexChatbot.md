# AWS::Connect::LexChatBot

An assignment of a lex chatbot to the specified connect instance.

## Properties

<dl>
<dt><span class="term"><code class="code">ConnectInstance</code></span></dt>
<dd>

<p>The name of the connect instance the lex chatbot is associated with.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Name</code></span></dt>
<dd>

<p>The name of the Lex Chatbot.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">AbortStatements</code></span></dt>
<dd>

<p>List of messages Lex should respond with if user aborts.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: List of Strings
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">AbortResponseCard</code></span></dt>
<dd>

<p>Text response to be included with an Abort Response.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Description</code></span></dt>
<dd>

<p>The description of the Lex Chatbot.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">ChildDirected</code></span></dt>
<dd>

<p>Indicates whether the chatbot is directed to children under the age of 13.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: Boolean
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">ClarificationAttempts</code></span></dt>
<dd>

<p>Indicates the number of times the Lex Chatbot should repeat the clarification prompt.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: Number
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">ClarificationPrompts</code></span></dt>
<dd>

<p>Messages the Lex Chatbot should respond with to prompt the user for clarification.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: List of Strings
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">ClarificationResponseCard</code></span></dt>
<dd>

<p>The text response that should accompany a Clarification Prompt.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">CreateVersion</code></span></dt>
<dd>

<p>Indicates whether a new version of the Lex Chatbot should be published.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: Boolean
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">DetectSentiment</code></span></dt>
<dd>

<p>Indicates whether the Lex Chatbot should use Sentiment Detection.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: Boolean
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">EnableImprovements</code></span></dt>
<dd>

<p>Indicates whether the Lex Chatbot should be configured to make automated adjustments to improve performance.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: Boolean
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">IdleSessionTTLInSeconds</code></span></dt>
<dd>

<p>The maximum time in seconds that Amazon Lex retains the data gathered in a conversation.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: Number
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Intents</code></span></dt>
<dd>

<p>An array of Intent objects.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: List of Objects
<ul>
    <li>intentName: String : Required!</li>
    <li>intentVersion: Number : Required!</li>
</ul>
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">NluIntnetConfidenceThreshold</code></span></dt>
<dd>

<p>The score that determines where Amazon Lex inserts the AMAZON.FallbackIntent, AMAZON.KendraSearchIntent, or both when returning alternative intents in a PostContent or PostText response. AMAZON.FallbackIntent is inserted if the confidence score for all intents is below this value. AMAZON.KendraSearchIntent is only inserted if it is configured for the bot.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: Float
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Locale</code></span></dt>
<dd>

<p>The target locale for the bot.

Possible values include:</p>
<ul>
    <li>de-DE</li>
    <li>en-AU</li>
    <li>en-GB</li>
    <li>en-US</li>
    <li>es-419</li>
    <li>es-ES</li>
    <li>es-US</li>
    <li>fr-FR</li>
    <li>fr-CA</li>
    <li>it-IT</li>
</ul>
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">ProcessBehavior</code></span></dt>
<dd>

<p>If you set the processBehavior element to BUILD, Amazon Lex builds the bot so that it can be run. If you set the element to SAVE Amazon Lex saves the bot, but doesn't build it.

If you don't specify this value, the default value is BUILD.

Possible values include:</p>
<ul>
    <li>SAVE</li>
    <li>BUILD</li>
</ul>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Tags</code></span></dt>
<dd>

<p>A list of tags to add to the bot. You can only add tags when you create a bot, you can't use the PutBot operation to update the tags on a bot.</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: List of Objects

Object Properties:</p>
<ul>
    <li>key : String : Required!</li>
    <li>value : String : Required!</li>
</ul>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">VoiceId</code></span></dt>
<dd>

<p>The Amazon Polly voice ID that Amazon Lex uses for voice interaction with the user.</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: String</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

</dl>


## Return Values

### Fn::GetAtt

<p>The <code class="code">Fn::GetAtt</code> intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.
</p>

<p>For more information about using the <code class="code">Fn::GetAtt</code> intrinsic function, see <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html">Fn::GetAtt</a>.
</p>

<dl>
<dt><span class="term"><code class="code">BotName</code></span></dt>
<dd>

<p>Returns the assigned Lex Chatbot Name.</p>

<p>Example: MyLexbot</p>

</dd>

<dt><span class="term"><code class="code">BotVersion</code></span></dt>
<dd>

<p>Returns the Lex Chatbot Version.</p>

<p>Example: v1</p>

</dd>

<dt><span class="term"><code class="code">Checksum</code></span></dt>
<dd>

<p>Returns the Lex Chatbot Revision Checksum.</p>

<p>Example: 1011</p>

</dd>

</dl>


## See Also

* [Amazon Connect Administrator Guide](https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html)

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
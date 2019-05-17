# AWS::Connect::ContactFlow State

A state within the contact flow.

## Properties


<dl>
<dt><span class="term"><code class="code">Id</code></span></dt>
<dd>

<p>A unique identifier for the state.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Type</code></span></dt>
<dd>

<p>The type of state.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Start</code></span></dt>
<dd>

<p>If true, the state represents the first state from the initiation of the flow.

Your states must contain a single start.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: Boolean
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Parameters</code></span></dt>
<dd>

<p>The relevant parameters of the state.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: List of <a href="AWS_Connect_ContactFlow_Parameter.md">Parameter</a>
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Branches</code></span></dt>
<dd>

<p>The branches from this state towards other states.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: List of <a href="AWS_Connect_ContactFlow_Branch.md">Branch</a>
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

</dl>
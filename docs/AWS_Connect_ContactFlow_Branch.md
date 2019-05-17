# AWS::Connect::ContactFlow Branch

A branch from one state to another.

## Properties


<dl>
<dt><span class="term"><code class="code">Destination</code></span></dt>
<dd>

<p>The identifier of the destination branch
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Condition</code></span></dt>
<dd>

<p>The condition on the current state from where to begin the branch.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

</dl>
# AWS::Connect::ContactFlow

The Amazon Connect contact flow resource defines the customer experience with the contact center from start to end. It is sometimes refered to as an IVR configuration.

> **Note**: As there is currently no way to delete a contact flow at all, the deletion of this resource type will silently retain the contact flow resource within the Amazon Connect instance.

## Properties


<dl>
<dt><span class="term"><code class="code">ConnectInstance</code></span></dt>
<dd>

<p>The name of the connect instance the contact flow is placed in.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Name</code></span></dt>
<dd>

<p>The name of the contact flow.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Description</code></span></dt>
<dd>

<p>The description of the contact flow.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">States</code></span></dt>
<dd>

<p>A list of flow states.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: List of <a href="AWS_Connect_ContactFlow_State.md">State</a>
</p>
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
<dt><span class="term"><code class="code">Name</code></span></dt>
<dd>

<p>Returns the name of the contact flow.</p>

<p>Example: <code class="code">mycontactflow</code>

</p>

</dd>

</dl>


## See Also

* [Amazon Connect Administrator Guide](https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html)
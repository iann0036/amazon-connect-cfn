# AWS::Connect::PhoneNumber

An assignment of a phone number connected to a contact flow.

## Properties

<dl>
<dt><span class="term"><code class="code">ConnectInstance</code></span></dt>
<dd>

<p>The name of the connect instance the phone number is associated with.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Name</code></span></dt>
<dd>

<dt><span class="term"><code class="code">ContactFlow</code></span></dt>
<dd>

<p>The name of the contact flow the phone number will route to.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Type</code></span></dt>
<dd>

<p>The phone number type.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Country</code></span></dt>
<dd>

<p>The requested country of origin.
</p>

<p><em>Required</em>: Yes
</p>
<p><em>Type</em>: String
</p>
<p><em>Update requires</em>: <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement">Replacement</a></p>
</dd>

<dt><span class="term"><code class="code">Description</code></span></dt>
<dd>

<p>The description of the phone number.
</p>

<p><em>Required</em>: No
</p>
<p><em>Type</em>: String
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
<dt><span class="term"><code class="code">PhoneNumber</code></span></dt>
<dd>

<p>Returns the assigned phone number with country code.</p>

<p>Example: <code class="code">+61 2 3456 7890</code>

</p>

</dd>

</dl>


## See Also

* [Amazon Connect Administrator Guide](https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html)
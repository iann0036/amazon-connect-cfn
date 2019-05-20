# AWS::Connect::Instance

An Amazon Connect instance contains all of the resources and settings related to your contact center.

After you create an instance, you can add further Amazon Connect resources within the instance by referencing it.

> **Note**: Removing this resource will remove any subresources such as contact flows and phone numbers.

## Properties

<dl>
<dt><span class="term"><code class="code">Domain</code></span></dt>
<dd>

<p>A globally-unique domain prefix for which the SSO directory will lie. This will be prepended to ".awsapps.com" to form your login domain. This is also referred to as the instance alias.
</p>

<p><em>Required</em>: Yes
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
<dt><span class="term"><code class="code">Domain</code></span></dt>
<dd>

<p>Returns the instance alias/domain prefix specified for the instance.</p>

<p>Example: <code class="code">mydomain</code>

</p>

</dd>

</dl>


## See Also

* [Amazon Connect Administrator Guide](https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html)
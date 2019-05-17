# AWS::Connect::Instance

The Amazon Connect instance resource creates a virtual call center instance within the account.

Removing this resource will remove any subresources such as contact flows and phone numbers.

## Properties

`Domain` - (Required) A globally-unique domain prefix for which the SSO directory will lie. This will be prepended to `.awsapps.com` to form your login domain.

`Something` - (Optional) The something.


## Return Values

### Fn::GetAtt

`Domain` - The domain specified in the Properties section.

`Arn` - The ARN of the Amazon Connect instance.

## See Also

* [Amazon Connect Administrator Guide](https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html)
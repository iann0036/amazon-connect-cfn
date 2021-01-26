const AWS = require('aws-sdk');
const connect = new AWS.Connect();

module.exports.createRoutingProfile = async (properties) => {
    // get connect instance id
    let instanceId;
    try {
        instanceId = await getInstanceId(properties.Domain);
    } catch(err) {
        console.error('Failed to Create RoutingProfile', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    
    // set params
    const params = {
        DefaultOutboundQueueId: properties.DefaultOutboundQueueId,
        Description: properties.Description,
        InstanceId: instanceId,
        MediaConcurrencies: properties.MediaConcurrencies.map(x => genMedCon(x.Channel, x.Concurrency)),
        Name: properties.Name,
        QueueConfigs: properties.QueueConfigs.map(x => genQueueConfig(x.Delay, x.Priority, x.ReferenceChannel, x.Id)),
        Tags: properties.Tags.map(x => genTag(x.Key, x.Value))
    };

    // create routing profile
    try {
        await connect.createRoutingProfile(params).promise();
    } catch(err) {
        console.error('Failed to Create RoutingProfile', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    return {
        status: 204,
        message: 'success!'
    }
}
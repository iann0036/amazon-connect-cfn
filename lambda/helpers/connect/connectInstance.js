const AWS = require('aws-sdk');
const connect = new AWS.Connect();


// Connect Helper Funcs
module.exports.getInstanceId = async (instanceName) => {
    let instance;
    try {
        const instances = await connect.listInstances({}).promise();
        console.debug('INSTANCES', JSON.stringify(instances));
        if(instances.err) {
            console.error('ListInstances Failed', JSON.stringify(err));
            console.error('RAW', err);
        }
        instance = instances.InstanceSummaryList.filter(x => x.InstanceAlias === instanceName)[0];
    } catch(err) {
        console.error('ListInstances Failed', JSON.stringify(err));
        console.error('RAW', err);
        throw err;
    }
    return instance.Id;
}

module.exports.getMedCon = (Channel, Concurrency) => {
    return { Channel, Concurrency};
}

// Connect Instance CRUD Funcs
module.exports.createConnectInstance = async (properties, instanceInfo) => {
    const params = {
        IdentityManagementType: 'CONNECT_MANAGED',
        InboundCallsEnabled: true,
        OutboundCallsEnabled: true,
        InstanceAlias: properties.Domain
    };
    console.debug('CREATE PARAMS', JSON.stringify(params));
    try {
        const instanceRes = await connect.createInstance(params).promise();
        if(instanceRes.err) {
            console.error('CreateInstance Failed', JSON.stringify(instanceRes.err));
            console.error('RAW', instanceRes.err);
        }
        console.debug('instanceRes', JSON.stringify(instanceRes));
        instanceInfo.instanceId = instanceRes.Id;
    } catch (err) {
        console.error('CreateInstance Failed', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
    return {
        'Domain': properties.Domain
    };
}

module.exports.deleteConnectInstance = async (properties) => {
    let toDelete;
    try{
        toDelete = await getInstanceId(properties.Domain);
    } catch(err) {
        console.error('DeleteInstanceFailed', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    try {
        const params = {
            InstanceId: toDelete
        };
        console.debug('DELETION PARAMS', JSON.stringify(params));
        await connect.deleteInstance(params).promise();
    } catch(err) {
        console.error('DeleteInstance Failed', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }
}
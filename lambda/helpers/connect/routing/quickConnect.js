const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const url = require('url');
const rp = require('request-promise');
const AWS = require('aws-sdk');

const connect = new AWS.Connect();
const { getInstanceId } = require('../connectInstance');
const { debugScreenshot, uploadResult, login, open } = require('../../puppeteer');

module.exports.createQuickConnect = async (properties) => {
    const params = {
        InstanceId: await getInstanceId(properties.Domain),
        Name: properties.Name,
        QuickConnectConfig: {
            QuickConnectType: properties.QuickConnectConfig.Type,
            PhoneConfig: {
                PhoneNumber: properties.QuickConnectConfig.PhoneNumber
            },
            QueueConfig: {
                ContactFlowId: properties.QuickConnectConfig.ContactFlowId,
                QueueId: properties.QuickConnectConfig.QueueId
            },
            UserConfig: {
                ContactFlowId: properties.UserConfig.ContactFlowId,
                UserId: properties.UserConfig.UserId
            },
            Description: properties.Description
        }
    };

    let quickConnect;
    try {
        quickConnect = await connect.createQuickConnect(params).promise();
        console.debug('QuickConnect', JSON.stringify(quickConnect));
    } catch(err) {
        console.error('Failed to CreateQuickConnect', JSON.stringify(err));
        console.error('RAW', err);
        return err;
    }

    return quickConnect;
};

module.exports.deleteQuickConnect = async (page, properties) => {

};
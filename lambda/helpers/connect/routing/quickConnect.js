const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const url = require('url');
const rp = require('request-promise');

const { debugScreenshot, uploadResult, login, open } = require('../../puppeteer');

module.exports.createQuickConnect = async (page, properties) => {

};

module.exports.deleteQuickConnect = async (page, properties) => {

};
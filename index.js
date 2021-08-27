async function getIndex () {
    console.log('Getting index from storage.');
    try {
        const client = new SSMClient({ region });
        const param = {
            Name: `/${work}/index`
        };
        const command = new GetParameterCommand(param);
        const result = await client.send(command);
        const index = parseInt(result.Parameter.Value, 10);
        if (isNaN(index) || index < 0 || lines.length <= index) {
            throw new Error(`Invalid index: ${index}`);
        }
        console.log('Get from storage success:', result);
        console.log(`Index from storage is ${result.Parameter.Value}.`);
        return index;
    } catch (error) {
        console.error('Get from storage failure:', error);
        throw error;
    }
}

async function setIndex (input) {
    console.log(`Saving index ${input} to storage.`);
    try {
        const index = parseInt(input, 10);
        if (isNaN(index) || index < 0) {
            throw new Error(`Invalid index: ${index}`);
        }
        const client = new SSMClient({ region });
        const param = {
            Name: `/${work}/index`,
            Overwrite: true,
            Type: 'String',
            Value: `${index}`,
        };
        const command = new PutParameterCommand(param);
        const result = await client.send(command);
        console.log('Save to storage success:', result);
        return result;
    } catch (error) {
        console.error('Save to storage failure:', error);
        throw error;
    }
}

function incrementAndSaveIndex (index) {
    index += 1;
    if (lines.length <= index) {
        index = 0;
    }
    console.log(`Index incremented to ${index}.`);
    setIndex(`${index}`).then(function (success) {}).catch(function (error) {});
}

function confirmTwitterConfig () {
    twitClient.get('account/verify_credentials', {
        skip_status: true,
    }).then(function (success) {
        console.log('Twitter config is valid:', success.data);
    }).catch(function (error) {
        console.error('Twitter config is invalid:', error.stack);
    });
}

function handler () {
    getIndex().then(function (index) {
        let line = lines[index];
        console.log(`Index from storage is ${index}. Line to tweet is:`, line);
        twitClient.post('statuses/update', {
            status: line,
        }, function (error, success) {
            if (error) {
                console.error('Post to Twitter failure:', error);
                if (error.code === 187) { // "Status is duplicate".
                    incrementAndSaveIndex(index);
                }
            } else {
                console.log('Post to Twitter success:', success);
                incrementAndSaveIndex(index);
            }
        });
    }).catch(function (error) {});
}

function devHandler () {
    switch (process.argv[3]) {
        case 'confirm-twitter':
            confirmTwitterConfig();
            break;
        case 'get-index':
            getIndex().then(function (success) {}).catch(function (error) {});
            break;
        case 'set-index':
            setIndex(process.argv[4]).then(function (success) {}).catch(function (error) {});
            break;
        case 'execute':
            handler(process.argv[2]);
            break;
        default:
            throw new Error(`Invalid instruction: ${process.argv[3]}`);
    }
}

const works = require('./works');
const work = process.env.WORK || process.argv[2];
if (!works.includes(work)) {
    throw new Error(`Invalid work: ${work}`);
}
const lines = require(`./lines/${work}`);

const Twit = require('twit');
const twitterConfig = require(`./config/twitter/${work}`);
const twitClient = new Twit(twitterConfig);

const { SSMClient, GetParameterCommand, PutParameterCommand } = require('@aws-sdk/client-ssm');
const region = require(`./config/aws/${work}`).region;

if (process.env.NODE_ENV !== 'production') {
    devHandler();
}

exports.handler = handler;

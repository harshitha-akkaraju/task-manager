"use strict";

const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');

const TOKEN_PATH = `/token.json`; // delete file if scope changes
const CREDENTIALS_PATH = `./credentials.json`;
const SCOPES = ['https://www.googleapis.com/auth/tasks']; // scope gives read/write access to tasks

const retrieveCredentials = (credentialsPath) => {
    let credentials = {};
    try {
        credentials = require(credentialsPath);
    } catch (err) {
        console.log(`[index.js] cannot find ${credentialsPath}...`)
        process.exit();
    }
    return credentials;
}

const retrieveToken = (tokenPath) => {
    let token = {};
    try {
        token = require(tokenPath);
    } catch (error) {
        throw error;
    }
    return token;
}

const authorize = (credentials, callback) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    let token = {};
    try {
        token = retrieveToken(TOKEN_PATH);
        oAuth2Client.setCredentials(token);
        callback(oAuth2Client);
    } catch (error) {
        generateNewToken(oAuth2Client, callback);
    }
}

const generateNewToken = (oAuth2Client, callback) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('[index.js] authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.log('[index.js] error retrieving access token', err);
                process.exit();
            }

            oAuth2Client.setCredentials(token);
            // store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('[index.js] token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
const listTasks = (auth) => {
    const service = google.tasks({ version: 'v1', auth });
    service.tasklists.list({
        maxResults: 10,
    }, (err, res) => {
        if (err) return console.error('The API returned an error: ' + err);
        const taskLists = res.data.items;
        if (taskLists) {
            console.log('Task lists:');
            taskLists.forEach((taskList) => {
                console.log(`${taskList.title} (${taskList.id})`);
            });
        } else {
            console.log('No task lists found.');
        }
    });
}

const credentials = retrieveCredentials(CREDENTIALS_PATH);

authorize(credentials, listTasks);
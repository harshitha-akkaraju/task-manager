"use strict";

const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');

const { createTask } = require('./manager');

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

const createRecurringTask = async (taskName, taskList, dayOfMonth) => {
    const credentials = retrieveCredentials(CREDENTIALS_PATH);

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
            oAuth2Client.getToken(code, async (err, token) => {
                if (err) {
                    console.log('[index.js] error retrieving access token', err);
                    process.exit();
                }

                oAuth2Client.setCredentials(token);
                await callback(oAuth2Client, taskName, taskList, dayOfMonth);
            });
        });
    }

    await authorize(credentials, createTask);
};

// createRecurringTask("title", "taskListName", dayOfMonth);
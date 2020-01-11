"use strict";

const {google} = require('googleapis');

const createTask = async (auth, taskName, taskListName, dayOfMonth) => {
    const taskListID = await getTaskListID(auth, taskListName);

    const body = {
        title: taskName,
        due: ""
    };
    let params = {
        auth: auth,
        tasklist: taskListID,
        requestBody: {}
    };

    const service = google.tasks({ version: 'v1', auth });
    for (let i = 0; i < 12; i++) {
        // currently creating tasks for the year 2020
        body.due = new Date(2020, i, dayOfMonth).toISOString().split('.')[0] + 'Z';
        params.requestBody = body;

        let promise = await service.tasks.insert(params);
        if (promise.status == 200) {
            let data = promise.data;
            console.log(data.id);
        } else {
            console.log(`[manager.js] Error creating task for ${taskName}`);
        }
    }
};

const getTaskListID = async (auth, taskListName) => {
    console.log(taskListName);
    const service = google.tasks({ version: 'v1', auth });
    const promise = await service.tasklists.list({
        maxResults: 10
    });
    let taskListID = "";
    if (promise.status == 200) {
        const taskLists = promise.data.items;
        if (taskLists) {
            taskLists.forEach((taskList) => {
                if (taskList.title === taskListName) {
                    taskListID = taskList.id;
                    return taskListID
                }
            });
        }
    } else {
        throw new Error("[manager.js] error getting taskListID");
        process.exit();
    }
    return taskListID;
};

module.exports = {
    createTask
};
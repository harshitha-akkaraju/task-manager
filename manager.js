const {google} = require('googleapis');

const createTask = (auth, taskName, taskListName, dayOfMonth) => {
    const taskListID = getTaskListID(auth, taskListName);

    const body = {
        title: taskName,
        due: ""
    };
    let params = {
        auth: auth,
        tasklist: taskList,
        requestBody: body
    };

    const service = google.tasks({ version: 'v1', auth });
    service.tasks.insert(params, (err, res) => {
        if (err) {
            console.log(err);
            console.log("[manager.js] Error inserting task");
            process.exit();
        }
        console.log(res.data);
    });
};

const getTaskListID = () => {
    return "";
};

module.exports = {
    createTask
};
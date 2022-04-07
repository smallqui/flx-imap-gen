const chalk = require('chalk');

//logs messages with colors
const log = (message, color) => {
    console.log(chalk[color](message));
};

//task logger
const taskLog = (id, message, color) => {
    console.log(chalk[color](`[${id.toString().padStart(4,'0')}] ${message}`));
};

module.exports = { log, taskLog };
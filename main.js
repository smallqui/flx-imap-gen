const { startTasks } = require('./src/task');
const taskAmount = require('./config.json').taskAmount;

startTasks(taskAmount);
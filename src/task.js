const Flx = require('./classes/flx');
const { setProxyList } = require('../lib/proxy');
const { startImap, setRunning } = require('./functions/index');

const startTasks = (count) => {
    setRunning(count);
    setProxyList();
    startImap();
    for(let i = 1; i <= count; i++)
        new Flx(i).start();
};

module.exports = { startTasks };
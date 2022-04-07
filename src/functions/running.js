let running = 0;
let stopped = 0;

const setRunning = count => {
    running = count;
};

const addStopped = () => {
    stopped++;
};

const getStatus= () => {
    return { running, stopped };
};

module.exports = { setRunning, addStopped, getStatus };
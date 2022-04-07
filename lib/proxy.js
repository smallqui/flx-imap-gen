const fs = require('fs');
const path = require('path');
const { log } = require('./log');
const proxyFile = path.join(__dirname, '../proxy.txt');
const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent');


//array with all the proxies loaded
let proxyList = new Array;

//reads file and sets proxy list
const setProxyList =  () => {
    try {
        let fileText = fs.readFileSync(proxyFile, 'utf8');
        proxyList = fileText.split('\n');
    }
    catch(error){
        log(`error loading proxy list - ${error.message}`, 'red');
    };
};

//gets random proxy from the proxy list array
const getProxy = () => {
    return proxyList[Math.floor(Math.random() * proxyList.length)];
};

//configures proxy for use with http agent
const getAgent = (proxy) => {
    let credentials = proxy.split(':');
    let agent = `http://${credentials[2]}:${credentials[3]}@${credentials[0]}:${credentials[1]}`;
    return { 
        http: new HttpProxyAgent({ proxy: agent }), 
        https: new HttpsProxyAgent({ proxy: agent })
    };
};

module.exports = { setProxyList, getProxy, getAgent };
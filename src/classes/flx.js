const { getProxy, getAgent } = require('../../lib/proxy');
const { saveAccount, generateCredentials } = require('../../lib/account');
const { sendWebhook } = require('../../lib/webhook');
const { taskLog } = require('../../lib/log');
const imapEmail = require('../../config.json').gmail.email;
const catchall = require('../../config.json').catchall;
const { CookieJar } = require('tough-cookie');
const { getSessionApi, postUsersApi, postVerifyApi, getEmails, addStopped } = require('../functions/index');

class Flx {

    constructor(id){
        this.id = id;
        this.cookieJar = new CookieJar;
        this.proxy = getProxy();
        this.agent = getAgent(this.proxy);
        this.attempts = 0;
    };

    async controller(step){
        try {
            this.next = await this[step]();
            setTimeout(() => this.controller(this.next));
        }
        catch(error){
            try {
                if(error.message == 'stop') throw error;
                if(error.message) taskLog(this.id, error.message, 'red');
                setTimeout(() => this.controller(step), 10000);
            } catch (e) {
                this.stop();
            };
        };
    };

    rotateProxy(){
        if(this.cookieJar.store.idx['www.footlocker.com'.slice(4)] !== undefined)
            delete this.cookieJar.store.idx['www.footlocker.com'.slice(4)];
        this.proxy = getProxy();
        this.agent = getAgent(this.proxy);
    };

    start(){
        taskLog(this.id, 'starting task', 'yellow');
        this.controller('generateSession');
    };

    generateSession(){
        return new Promise((resolve, reject) => {
            taskLog(this.id, 'getting session', 'yellow');

            getSessionApi(this.cookieJar, this.agent)
                .then(({ body, headers }) => {
                    this.csrf = body.data.csrfToken;
                    this.session = headers['x-flapi-session-id'];
                    resolve('submitAccount');
                })
                .catch(({ response }) => {
                    if(!response) 
                        reject({ message: 'request error, retrying' });
                    //add a datadome gen if you dont want to rotate
                    else if(response.statusCode == 403){
                        this.rotateProxy();
                        reject({ message: 'datadome blocked, rotating proxy' });
                    }
                    else if(response.statusCode == 429)
                        reject({ message: 'rate limited, retrying' });
                    else if(response.statusCode >= 500 && response.statusCode <= 599)
                        reject({ message: 'server error, retrying'})
                    else
                        reject({ message: `unknown error (${response.statusCode}), retrying` });
                });
        });
    };

    submitAccount(){
        return new Promise((resolve, reject) => {
            taskLog(this.id, 'submitting account info', 'yellow');
            this.account = generateCredentials(catchall);
            let body = JSON.stringify({
                "bannerEmailOptIn": false,
                "preferredLanguage": "en",
                "firstName": this.account.first,
                "lastName": this.account.last,
                "birthday": this.account.birthday,
                "postalCode": this.account.zip,
                "uid": this.account.email,
                "password": this.account.password,
                "phoneNumber": this.account.phone,
                "loyaltyStatus": true,
                "wantToBeVip": false,
                "flxTcVersion": "2.0",
                "loyaltyFlxEmailOptIn": true
            });
            postUsersApi(body, this.csrf, this.session, this.cookieJar, this.agent)
                .then(() => {
                    taskLog(this.id, 'account created, starting verification process', 'green');
                    resolve('getActivationToken');
                })
                .catch(({ response }) => {
                    if(!response) 
                        reject({ message: 'request error, retrying' });
                    else if(response.statusCode == 400 || response.statusCode == 409)
                        reject({ message: 'invalid user credentials, retrying' });
                    //add a datadome gen if you dont want to rotate
                    else if(response.statusCode == 403){
                        this.rotateProxy();
                        reject({ message: 'datadome blocked, rotating proxy' });
                    }
                    else if(response.statusCode == 429)
                        reject({ message: 'rate limited, retrying' });
                    else if(response.statusCode >= 500 && response.statusCode <= 599)
                        reject({ message: 'server error, retrying'})
                    else
                        reject({ message: `unknown error (${response.statusCode}), retrying` });
                });
        });
    };

    getActivationToken(){
        return new Promise((resolve, reject) => {
            taskLog(this.id, 'retrieving activation token', 'yellow');
            let availableTokens = getEmails()
                .filter(({ account, activationToken }) => account == this.account.email.toLowerCase() && activationToken != 'fake')
                .map(({ activationToken }) => activationToken);

            if(availableTokens.length != 0){
                this.activationToken = availableTokens[Math.floor(Math.random() * availableTokens.length)]
                resolve('verifyAccount');
            }
            else {
                this.attempts++;
                if(this.attempts >= 15) {
                    taskLog(this.id, 'activation token attempt limit reached, stopping task', 'red');
                    reject({ message: 'stop' });
                }
                else
                    reject({ message: `no activation token found - attempt ${this.attempts}/15, retrying` });
            };  
        });
    };

    verifyAccount(){
        return new Promise((resolve, reject) => {
            taskLog(this.id, 'verifying account', 'blue');
            let payload = JSON.stringify({ "activationToken": this.activationToken });
            postVerifyApi(payload, this.csrf, this.activationToken, this.cookieJar, this.agent)
                .then(({ body }) => {
                    let { activationStatus } = body;
                    if(activationStatus == 'Success'){
                        saveAccount(this.account.email, this.account.password, this.proxy);
                        sendWebhook(this.account.email, this.account.password, imapEmail, catchall, this.proxy);
                        taskLog(this.id, 'flx account successfully verified', 'green');
                        reject({ message: 'stop' });
                    }
                    else {
                        taskLog('account verification failed - stopping task', 'red');
                        reject({ message: 'stop' });
                    };
                })
                .catch(({ response }) => {
                    if(!response) 
                        reject({ message: 'request error, retrying' });
                    else if(response.statusCode == 403){
                        this.rotateProxy();
                        reject({ message: 'datadome blocked, rotating proxy' });
                    }
                    else if(response.statusCode == 429)
                        reject({ message: 'rate limited, retrying' });
                    else if(response.statusCode >= 500 && response.statusCode <= 599)
                        reject({ message: 'server error, retrying'})
                    else
                        reject({ message: `unknown error (${response.statusCode}), retrying` });
                });
        });
    };

    stop(){
        addStopped();
        taskLog(this.id, 'task stopped', 'red');
    };
};

module.exports = Flx;
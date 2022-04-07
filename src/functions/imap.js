const Imap = require('imap'), inspect = require('util').inspect;
const fs = require('fs');
const { simpleParser } = require('mailparser');
const gmail = require('../../config.json').gmail;
const { log } = require('../../lib/log');
const { getStatus } = require('./running');
let emails = new Object;

const imapConfig = {
    user: gmail.email,
    password: gmail.password,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
};

/*
probably a better way to do this ill update the repo sometime in the future once i learn more about imap feel free to fork
*/

const findFlxEmails = () => {
    try {
        const imap = new Imap(imapConfig);
        imap.once('ready', () => {
            log('checking emails', 'green');
            imap.openBox('INBOX', true, () => {
                imap.search([ 'UNSEEN', ['FROM', 'FLX@e.flxprogram.com'], ['SINCE', new Date()] ], (error, results) => {
                    if(error) throw error;
                    //empty inbox if results are empty so we add a handler here
                    else if(!results || !results.length){
                        emails = [];
                        imap.end();
                    }
                    else {
                        const f = imap.fetch(results, { bodies: '' });
                        let parsedEmails = new Array;
                        f.on('message', msg => {
                            msg.on('body', stream => {
                                simpleParser(stream, async (error, parsed) => {
                                    let { html, to } = parsed;
                                    let account = to.text;
                                    let regex = /(?:activationToken=)([\s\S]*?)(?:\&)/;
                                    let activationToken = html.match(regex) ? html.match(regex)[1] : 'fake';
                                    parsedEmails.push({ account: account, activationToken: decodeURIComponent(activationToken) });
                                });
                            });
                        });
                        f.once('error', error => {
                            log(`imap f error - ${error.message}`);
                        });
                        f.once('end', () => {
                            emails = parsedEmails;
                            imap.end();
                        });
                    }
                });
            });
        });
        imap.once('error', error => {
            log(`email error - ${error.message}`, 'red');
        });
        imap.once('end', () => {
            log('emails parsed', 'yellow');
        });
        imap.connect();
    }
    catch(error){
        log(`imap error - ${error.message}`, 'red');
    }
};


const checkImap = () => {
    let { running, stopped } = getStatus();
    if(running != 0 && stopped != 0){
        if(running == stopped) return true;
        else return false;
    }
    else return false
    
};

const getEmails = () => {
    return emails;
};

const startImap = () => {
    findFlxEmails();
    if(checkImap())
        log('imap stopped', 'red');
    else 
        setTimeout(() => startImap(), 10000);
};

module.exports = { getEmails, startImap };
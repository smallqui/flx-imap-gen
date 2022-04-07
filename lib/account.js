const fs = require('fs');
const Chance = require('chance');
const { log } = require('./log');
const pw = require('generate-password');
const path = require('path');
const accountFile = path.join(__dirname, '../accounts.txt');
const logProxy = require('../config.json').logProxy;

const chance = new Chance;

//generates random number between 100-1000
let randomNumber = () => {
    return Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
};

/*
Between 8-16 characters\n\n
Both upper AND lowercase letters\n\n
A number (0-9)\n\n
A special character. You can use ! @ # $ % ^ * ( ) _ - + { } ; : . ,
*/
let randomPassword = () => {
    let specialCharacters = ['!','@','#','$','%','^','*','(',')','_','-','+','{','}',';',':','.',','];
    let randomString = pw.generate({ length: 10, uppercase: true, lowercase: true, numbers: true });
    let i = Math.floor(Math.random() * randomString.length);
    const left = randomString.slice(0, i);
    const right = randomString.slice(i + 1);
    return left + specialCharacters[Math.floor(Math.random() * specialCharacters.length)] + randomNumber() + right;
};

//generates random birthday in footlocker format (probably better way to do this)
let randomBirthday = () => {
    let start = new Date(2000, 3, 6);
    let end = new Date(2001, 3, 6);
    let date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`
};

//saves account into accounts.txt
const saveAccount = (username, password, proxy) => {
    fs.appendFile(accountFile, logProxy ? `${username}:${password}:${proxy}\n` : `${username}:${password}\n`, (error) => {
        if(error) log(`error saving account - ${error.message}`);
    });
};

//generates footlocker account credentials
const generateCredentials = (catchall) => {
    let first = chance.first();
    let last = chance.last({ nationality: 'en' });
    let email = `${first}${last}${randomNumber()}@${catchall}`;
    let password = randomPassword();
    let birthday = randomBirthday();
    let zip = chance.zip();
    let phone = chance.phone({ formatted: false, country: 'us' });

    return { first, last, email, password, birthday, zip, phone };
};

module.exports = { saveAccount, generateCredentials };
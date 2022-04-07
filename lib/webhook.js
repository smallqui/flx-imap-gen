const { WebhookClient, MessageEmbed } = require('discord.js');
const { log } = require('./log');
const webhook = require('../config.json').webhook;
const image = 'https://www.footlocker.com/built/216/images/FL/icon-192.png';

// regex gets discord id and token
const parseCredentials = (webhook) => {
    let regex = /discord.com\/api\/webhooks\/([^\/]+)\/([^\/]+)/;
    let credentials = webhook.match(regex);
    return { id: credentials[1], token: credentials[2] };
};

//sends discord webhook
const sendWebhook = (flxEmail, flxPassword, imapEmail, catchall, proxy) => {
    if(!webhook || webhook == undefined) return null;
    else {

        const client = new WebhookClient(parseCredentials(webhook));

        const embed = new MessageEmbed()
            .setColor('000000')
            .setTitle('Account Generated and Verified ✅')
            .setAuthor({ name: 'flx-imap-gen' })
            .setFields(
                { name: 'FLX Account Email', value: `||${flxEmail}||`, inline: true },
                { name: 'FLX Account Password', value: `||${flxPassword}||`, inline: true },
                { name: 'Catchall', value: `||${catchall}||`, inline: false },
                { name: 'IMAP Email', value: `||${imapEmail}||`, inline: false },
                { name: 'Proxy Used', value: `||${proxy}||`, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'https://github.com/B75571' })
            .setThumbnail(image);

        client.send({ embeds: [embed] })
            .catch(({ message }) => log(`Error Sending Webhook - ${message}`, 'red' ));
    };
};

module.exports = { sendWebhook };
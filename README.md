# flx-imap-gen

Open source Footlocker FLX account generator that verifies your emails via imap (gmail only)

Proxies are required

In order for this to work you need to make sure these settings are enabled on the google account that the emails are forwarded to:
Enable IMAP

Enable less secure apps

Config file details: 
Task amount - number of FLX accounts you want generated

Webhook - discord webhook

Gmail - email that will be forwared the emails from your catchall

Catchall - catchall domain name don't include the @ symbol

Log Proxy - if you want to log the proxy in the accounts.txt - this is for people who want to use to export to raffle bots

**Accounts.txt - accounts generated will be posted here**

**Proxy.txt - put proxies here**

**To start the generator:**

Clone or download repo

npm install

npm start

<img width="551" alt="Screen Shot 2022-04-07 at 1 23 17 AM" src="https://user-images.githubusercontent.com/80978958/162126146-d52d0b80-6852-4e7f-9831-11fcf6e8637f.png">

Hope to revisit this repo once I get more exp with IMAP since it's my first time trying it. Feel free to fork!

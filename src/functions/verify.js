const got = require('got');
const { v4 } = require('uuid');

const postVerifyApi = (body, csrf, activationToken, cookieJar, agent) => {
    let url = 'https://www.footlocker.com/api/v3/activation';
    let options = {
        body: body,
        headers: {
            'authority': 'www.footlocker.com',
            'accept': 'application/json',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/json',
            'origin': 'https://www.footlocker.com',
            'referer': `https://www.footlocker.com/user-activation.html?activationToken=${activationToken}&ssoComplete=true&inStore=false`,
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
            'x-csrf-token': csrf,
            'x-fl-request-id': v4()
        },
        cookieJar: cookieJar,
        agent: agent,
        responseType: 'json',
        followRedirect: false
    };
    return got.post(url, options);
};

module.exports = { postVerifyApi };
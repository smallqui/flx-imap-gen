const got = require('got');
const { v4 } = require('uuid');

const getSessionApi = (cookieJar, agent) => {
    let url = 'https://www.footlocker.com/api/session';
    let options = {
        headers: {
            'authority': 'www.footlocker.com',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36',
            'accept': 'application/json',
            'x-fl-request-id': v4(),
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://www.footlocker.com/',
            'accept-language': 'en-US,en;q=0.9',
        },
        cookieJar: cookieJar,
        agent: agent,
        responseType: 'json',
        followRedirect: true
    };
    return got(url, options);
};

module.exports = { getSessionApi };


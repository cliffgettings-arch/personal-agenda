const https = require('https');

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) return { statusCode: 500, body: 'Token not configured' };

    const { content, sha } = JSON.parse(event.body);

    const payload = JSON.stringify({
        message: `Update events — ${new Date().toLocaleString()}`,
        content,
        sha,
        branch: 'main'
    });

    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'api.github.com',
            path: `/repos/cliffgettings-arch/personal-agenda/contents/events.json`,
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'personal-agenda-app',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
                statusCode: res.statusCode,
                body: data
            }));
        });
        req.on('error', err => resolve({ statusCode: 500, body: err.message }));
        req.write(payload);
        req.end();
    });
};
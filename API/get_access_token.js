const config = require('./pay_config.js');
const request = require('request')
const fs = require('fs')

request.get({
    uri: 'https://api.weixin.qq.com/cgi-bin/token',
    json: true,
    qs: {
        grant_type: 'client_credential',
        appid: config.appid,
        secret: config.secret
    }
}, (err, res, body) => {
    if (err) {
        console.log(err)
        return
    }
    let token = body.access_token
    //写入./token.txt
    fs.writeFile('./token.txt', token, (err) => {
        if (err) {
            console.log(err)
            return
        }
    })
})
